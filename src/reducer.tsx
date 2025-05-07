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
 * The reducer that modifies global team data
 */
export function teamReducer(state: Data.Team, action: Action) {
	switch (action.type) {
		// Store the data payload as the new team object
		case Task.select_team: {
			return action.data;
		};

		// Set the name of the team to the data payload
		case Task.change_name: {
			return {
				...state,
				name: action.data
			}
		};

		// Add or remove the pokemon specified in the data payload
		case Task.select_pokemon: {
			const pokemon = state.pokemon.slice();

			// Remove the pokemon from the party if it has already been added
			for (let i=0; i < pokemon.length; ++i)
			{
				if (pokemon[i].id === action.data.id && pokemon[i].form === action.data.form)
				{
					pokemon.splice(i, 1);
					return {
						...state,
						pokemon: pokemon
					};
				}
			}

			// Add the pokemon to the party
			if (pokemon.length < 6)
			{
				pokemon.push({id: action.data.id, form: action.data.form, ability: 0});
				return {
					...state,
					pokemon: pokemon
				};
			}

			return state;
		};

		// Toggle the ability of a pokemon
		case Task.swap_ability: {
			// Determine which generation is being used in the planner
			let generation = 9;
			for (const game of Data.game_list)
			{
				if (game.id === state.pokedex)
				{
					generation = game.generation;
					break;
				}
			}

			// Find which pokemon is being targeted by the action
			const pokemon = state.pokemon.slice()
			for (let i=0; i < pokemon.length; ++i)
			{
				if (pokemon[i] === action.data)
				{
					const party_pokemon = structuredClone(pokemon[i]);

					// Cycle between ability slots, skipping slots with no ability
					const abilities = Data.getPokemonAbilities(generation, party_pokemon.id, party_pokemon.form);
					const ability_slots = generation > 4 ? 2 : 1;
					do
					{
						party_pokemon.ability++;
						if (party_pokemon.ability > ability_slots)
							party_pokemon.ability = 0;
					} while (!abilities[party_pokemon.ability]);
					
					pokemon[i] = party_pokemon;
				}
			}

			return {
				...state,
				pokemon: pokemon
			};
		};
	}
}

export const TeamContext = createContext<Data.Team>({
	id: 0,
	name: "Invalid Team",
	pokedex: 'rby',
	pokemon: []
});
export const DispatchContext = createContext<ActionDispatch<[Action]>>(()=>{
	console.error("Invalid dispatch function.");
});

/**
 * A wrapper component that provides the team reducer for child components
 */
export function TeamProvider(props: {children: ReactNode}): ReactElement
{
	const [tasks, dispatch] = useReducer(teamReducer, {
		id: 0,
		name: "New Team",
		pokedex: 'rby',
		pokemon: []
	});

	return (
		<TeamContext.Provider value={tasks}>
			<DispatchContext.Provider value={dispatch}>
				{props.children}
			</DispatchContext.Provider>
		</TeamContext.Provider>
	);
}