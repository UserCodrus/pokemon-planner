import * as Data from "./data";

import { ActionDispatch, createContext, ReactElement, ReactNode, useContext, useReducer } from "react";

/**
 * Constants describing the various actions that can be performed on team data via the reducer
 * @param home Returns the app to the landing page. Data is not used.
 * @param change_game Change the selected game. Data should be a game id matching a game in Data.game_list
 * @param load_teams Store a set of teams. Data should be an array of Data.Team.
 * @param save_current_team Overwrite changes made to the current team. Data is not used.
 * @param save_new_team Save the current team to a new slot, assigning it a new id. Data is not used.
 * @param new_team Delete the existing team in the current_team slot and create a new one. Data is not used.
 * @param select_team Sets the team with a matching id to the current team. Data should be a number corresponding to a team id.
 * @param delete_team Delete a team from the team list. Data should be the team id of the team being deleted.
 * @param change_name Change the name of the current team. Data should be a string corresponding to the new team name.
 * @param select_pokemon Add a pokemon to the current team, or remove it if it has already been added. Data should be a TeamSlot object corresponding to the new pokemon.
 * @param swap_ability Toggle a team member's ability. Data should be a TeamSlot object with an id and form matching a party member.
 * @param open_modal Open a modal pop-up box with a set of buttons. Data should be a Data.Modal object describing the modal's contents.
 * @param close_modal Clears the current modal pop-up. Data is not used.
 */
export const enum Task {
	home,
	change_game,
	load_teams, 

	save_current_team,
	save_new_team,
	new_team,
	select_team,
	delete_team,

	change_name,
	select_pokemon,
	swap_ability,

	open_modal,
	close_modal
}

/**
 * An enum describing all of the views available in the app
 */
export const enum View {
	home,
	planner,
	compare
}

/**
 * The data type for a teamReducer action
 */
export type Action = {
	type: Task,
	data?: any
}

/**
 * Global data for the app
 */
export type AppData = {
	view: View,
	game: Data.Game | null,
	current_team: Data.Team | null,
	teams: Data.Team[] | null,
	modal: Data.Modal | null
};

export function newTeam(teams: Data.Team[], game: string): Data.Team {
	// Get the last team id used by existing teams
	let team_id = 0;
	for (const team of teams)
	{
		if (team.id > team_id)
			team_id = team.id;
	}

	return {
		id: team_id + 1,
		game: game,
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
		// Set the game to null to revert to the home screen
		case Task.home: {
			window.scrollTo(0, 0);
			return {
				...state,
				view: View.home
			}
		};

		// Find a game matching the provided id and set the planner view
		case Task.change_game: {
			if (!action.data)
				return {
					...state,
					game: null,
					view: View.home
				}

			let selected_game: Data.Game | undefined;
			for (const game of Data.game_list)
			{
				if (game.id === action.data)
				{
					selected_game = game;
					break;
				}
			}

			if (selected_game)
			{
				window.scrollTo(0, 0);
				return {
					...state,
					current_team: newTeam(state.teams!, selected_game.id),
					game: selected_game,
					view: View.planner
				}
			}
		};

		// Overwrite the current team data with the provided teams
		case Task.load_teams: {
			return {
				...state,
				teams: action.data as Data.Team[]
			}
		};

		// Store changes made to the current team
		case Task.save_current_team: {
			if (!state.teams || !state.current_team)
				break;

			// Remove the team from its current spot in the team list if it has already been saved
			const team_list = state.teams.slice();
			for (let i = 0; i < team_list.length; ++i)
			{
				if (team_list[i].id === state.current_team.id)
				{
					team_list.splice(i, 1);
					break;
				}
			}

			// Add the team data back into the team list
			team_list.push(structuredClone(state.current_team));
			return {
				...state,
				teams: team_list
			};
		};

		// Store the current team to the team list as a new team
		case Task.save_new_team: {
			if (!state.teams || !state.current_team)
				break;

			// Get an unused team id
			const team_list = state.teams.slice();
			let team_id = 0;
			for (const team of team_list)
			{
				if (team.id > team_id)
					team_id = team.id;
			}

			// Copy the team data and add it to the team list
			const new_team = structuredClone(state.current_team);
			new_team.id = team_id + 1;

			team_list.push(new_team);
			return {
				...state,
				current_team: new_team,
				teams: team_list
			};
		};

		// Reset the active team
		case Task.new_team: {
			if (!state.teams)
				break;

			const new_team = newTeam(state.teams, state.game!.id);
			return {
				...state,
				current_team: new_team
			}
		};

		// Set the team with the given id as the active team and load the planner
		case Task.select_team: {
			if (!state.teams)
				break;
			
			let selected_team: Data.Team | null = null;
			if (state.current_team && (state.current_team.id === action.data))
			{
				// If the selected team is the same as the current team, skip searching for teams
				selected_team = state.current_team;
			}
			else
			{
				// Searth the team list to find a team with a matching id
				const team_list = state.teams.slice();
				for (const team of team_list)
				{
					if (team.id === action.data)
					{
						selected_team = structuredClone(team);
						break;
					}
				}
			}

			if (!selected_team)
				break;

			// Set the game to match the team's required game
			let selected_game: Data.Game | undefined;
			for (const game of Data.game_list)
			{
				if (game.id === selected_team.game)
				{
					selected_game = game;
					break;
				}
			}
			
			if (selected_game)
			{
				window.scrollTo(0, 0);
				return {
					...state,
					game: selected_game,
					current_team: selected_team,
					view: View.planner
				}
			}
		};

		// Find a team in the team list and remove it
		case Task.delete_team: {
			if (!state.teams)
				break;

			console.log("deleting team: " + action.data)
			console.log(state.teams);
			const team_list = state.teams.slice();
			const team_index = team_list.findIndex((value)=>value.id === action.data);

			if (team_index > -1)
			{
				console.log("Team delete")
				team_list.splice(team_index, 1);
				return {
					...state,
					teams: team_list
				}
			}
		};

		// Set the name of the team to the data payload
		case Task.change_name: {
			if (!state.current_team)
				break;

			return {
				...state,
				current_team: {
					...state.current_team,
					name: action.data as string
				}
			}
		};

		// Add or remove the pokemon specified in the data payload
		case Task.select_pokemon: {
			if (!state.current_team)
				break;

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
		};

		// Toggle the ability of a pokemon
		case Task.swap_ability: {
			if (!state.game || !state.current_team)
				return state;

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

		// Open a modal pop-up
		case Task.open_modal: {
			return {
				...state,
				modal: action.data
			}
		};

		// Close the current modal pop-up
		case Task.close_modal: {
			return {
				...state,
				modal: null
			}
		};
	}

	console.error("Failed to apply action id: " + action.type);
	return state;
}

export const DispatchContext = createContext<ActionDispatch<[Action]>>(()=>{
	console.error("Invalid dispatch function.");
});
export const GameContext = createContext<Data.Game | null>(null);