import * as Data from "./data";

import { ActionDispatch, createContext, ReactElement, ReactNode, useContext, useReducer } from "react";

/**
 * Constants describing the various actions that can be performed on team data via the reducer
 */
export const enum Task {
	select_team,
	change_name,
	select_pokemon,
	swap_ability
}

/**
 * The data type for a teamReducer action
 */
export type Action = {
	type: Task,
	data: any
}

/**
 * 
 */

/**
 * Global data for the app
 */
export type AppData = {
	game: Data.Game | null,
	current_team: Data.Team,
	teams: Data.Team[]
};

export function newTeam(teams: Data.Team[]): Data.Team {
	// Get the last team id used by existing teams
	let team_id = 0;
	for (const team of teams)
	{
		if (team.id > team_id)
			team_id = team.id;
	}

	return {
		id: team_id + 1,
		name: "New Team",
		pokemon: [],
		abilities: []
	}
}

/**
 * The reducer that modifies global team data
 */
export function teamReducer(state: AppData, action: Action) {
	switch (action.type) {
		// Store the data payload as the new team object
		case Task.select_team: {
			return action.data;
		};

		// Set the name of the team to the data payload
		case Task.change_name: {
			return {
				...state,
				current_team: {
					...state.current_team,
					name: action.data
				}
			}
		};

		// Add or remove the pokemon specified in the data payload
		case Task.select_pokemon: {
			const pokemon = state.current_team.pokemon.slice();
			const abilities = state.current_team.abilities.slice();

			// Remove the pokemon from the party if it has already been added
			for (let i=0; i < pokemon.length; ++i)
			{
				if (pokemon[i].id === action.data.id && pokemon[i].form === action.data.form)
				{
					pokemon.splice(i, 1);
					abilities.splice(i, 1);
					return {
						...state,
						current_team: {
							...state.current_team,
							pokemon: pokemon,
							abilities: abilities
						}
					};
				}
			}

			// Add the pokemon to the party
			if (pokemon.length < 6)
			{
				pokemon.push({id: action.data.id, form: action.data.form});
				abilities.push(0);
				return {
					...state,
					current_team: {
						...state.current_team,
						pokemon: pokemon,
						abilities: abilities
					}
				};
			}

			return state;
		};

		// Toggle the ability of a pokemon
		case Task.swap_ability: {
			if (!state.game)
				return null;

			// Find which pokemon is being targeted by the action
			const pokemon = state.current_team.pokemon;
			const abilities = state.current_team.abilities.slice();
			for (let i = 0; i < pokemon.length; ++i)
			{
				if (pokemon[i] === action.data)
				{
					// Cycle between ability slots, skipping slots with no ability
					const ability_data = Data.getPokemonAbilities(state.game.generation, pokemon[i].id, pokemon[i].form);
					const ability_slots = state.game.generation > 4 ? 2 : 1;
					do
					{
						abilities[i]++;
						if (abilities[i] > ability_slots)
							abilities[i] = 0;
					} while (!ability_data[abilities[i]]);
				}
			}

			return {
				...state,
				current_team: {
					...state.current_team,
					abilities: abilities
				}
			};
		};
	}
}

export const DataContext = createContext<AppData>({
	game: Data.game_list[0],
	current_team: {
		id: 0,
		name: "New Team",
		pokemon: [],
		abilities: []
	},
	teams: []
});
export const DispatchContext = createContext<ActionDispatch<[Action]>>(()=>{
	console.error("Invalid dispatch function.");
});