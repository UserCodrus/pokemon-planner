import * as Data from "./data";

import { ActionDispatch, createContext } from "react";

/**
 * Constants describing the various actions that can be performed on team data via the reducer
 * @param home_view Returns the app to the landing page. Data is not used.
 * @param compare_view Switches to the comparison view. Data is not used.
 * @param planner_view Change the selected game. Data should be a game id matching a game in Data.game_list
 * @param restory_history_state Reset the app's state to match a historic state provided by a popstate event. Data should be an object containing the view and party states.
 * @param load_team_data Store a set of teams. Data should be an array of Data.Team.
 * 
 * @param save_current_team Overwrite changes made to the current team. Data is not used.
 * @param save_new_team Save the current team to a new slot, assigning it a new id. Data is not used.
 * @param new_team Delete the existing team in the current_team slot and create a new one. Data is not used.
 * @param select_team Sets the team with a matching id to the current team. Data should be a number corresponding to a team id.
 * @param delete_team Delete a team from the team list. Data should be the team id of the team being deleted.
 * 
 * @param change_name Change the name of the current team. Data should be a string corresponding to the new team name.
 * @param select_pokemon Add a pokemon to the current team, or remove it if it has already been added. Data should be a TeamSlot object corresponding to the new pokemon.
 * @param reorder_team Change the order of the current party. Data should be an array containing the indices of each team member in the current party.
 * @param swap_ability Toggle a team member's ability. Data should be a TeamSlot object with an id and form matching a party member.
 */
export const enum Task {
	home_view,
	game_view,
	compare_view,
	planner_view,
	restory_history_state,
	load_team_data,

	save_current_team,
	save_new_team,
	new_team,
	select_team,
	delete_team,

	change_name,
	select_pokemon,
	reorder_team,
	swap_ability
}

/**
 * The page name for the compare view
 */
export const compare_page = "compare";
export const selector_page = "games";

/**
 * An enum describing all of the views available in the app
 */
export const enum View {
	home,
	planner,
	compare,
	games
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
	current_team: Data.Team | null,
	teams: Data.Team[] | null
};

// Create a new team for the app
function newTeam(teams: Data.Team[], game: string): Data.Team {
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

// Get the url segment of the current view
function getURLSegment(view: View, game?: string): string
{
	switch (view) {
		case View.home: return "";
		case View.compare: return "compare";
		case View.games: return "games";
		case View.planner:  return (game ? game : "nat");
	}
}

/**
 * A function that saves the state of the app when the view is switched and the url changes
 * @param current_state The current state of the app
 * @param new_state The state that the app is switching to
 * @param page The url segment of the current page
 * @param force If set to true, the app will push to history even if the url hasn't changed
 */
function saveHistory(current_state: AppData, new_state: AppData, page?: string, force?: boolean)
{
	// Update the current state of the app before pushing a new state
	const update_state = {
		view: current_state.view,
		team: structuredClone(current_state.current_team)
	};
	history.replaceState(update_state, "");

	// Add the new state to browser history if the URL has changed
	const url = window.location.origin + (page ? "/" + page : "");
	if (url != window.location.href || force)
	{
		const app_state = {
			view: new_state.view,
			team: structuredClone(new_state.current_team)
		};
		history.pushState(app_state, "", url);
	}
}

/**
 * The reducer that modifies global team data
 */
export function teamReducer(state: AppData, action: Action) {
	switch (action.type) {
		// Switch to the home view
		case Task.home_view: {
			window.scrollTo(0, 0);
			const new_state = {
				...state,
				view: View.home
			};
			saveHistory(state, new_state, getURLSegment(new_state.view, state.current_team?.game));
			return new_state;
		};

		// Switch to the game selector view
		case Task.game_view: {
			window.scrollTo(0, 0);
			const new_state = {
				...state,
				view: View.games
			};
			saveHistory(state, new_state, getURLSegment(new_state.view, state.current_team?.game));
			return new_state;
		}

		// Switch to the compare view
		case Task.compare_view: {
			window.scrollTo(0, 0);
			const new_state = {
				...state,
				view: View.compare
			};
			saveHistory(state, new_state, getURLSegment(new_state.view, state.current_team?.game));
			return new_state;
		};

		// Find a game matching the provided id and set the planner view
		case Task.planner_view: {
			if (!action.data)
				return {
					...state,
					game: null,
					view: View.home
				}

			const selected_game = Data.getGame(action.data);
			if (selected_game)
			{
				window.scrollTo(0, 0);
				const new_state = {
					...state,
					current_team: newTeam(state.teams!, selected_game.id),
					game: selected_game,
					view: View.planner
				};
				saveHistory(state, new_state, getURLSegment(new_state.view, selected_game.id));

				return new_state;
			}
		};

		// Restore the state provided by the popstate event
		case Task.restory_history_state: {
			if (action.data.view !== undefined)
			{
				return {
					...state,
					view: action.data.view,
					current_team: structuredClone(action.data.team)
				};
			}
			else
			{
				return {
					...state,
					view: View.home,
					current_team: null
				};
			}
		}

		// Overwrite the current team data with the provided teams
		case Task.load_team_data: {
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

			const new_team = newTeam(state.teams, state.current_team ? state.current_team.game : "nat");
			const new_state = {
				...state,
				current_team: new_team
			}
			saveHistory(state, new_state, getURLSegment(new_state.view, state.current_team?.game), true);

			return new_state;
		};

		// Set the team with the given id as the active team and load the planner
		case Task.select_team: {
			if (!state.teams)
				break;
			
			let selected_team: Data.Team | null = null;
			if (state.current_team && (state.current_team.id === action.data || !action.data))
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

			const selected_game = Data.getGame(selected_team.game);
			if (selected_game)
			{
				window.scrollTo(0, 0);
				const new_state = {
					...state,
					game: selected_game,
					current_team: selected_team,
					view: View.planner
				}
				saveHistory(state, new_state, getURLSegment(new_state.view, selected_game.id));

				return new_state;
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

		// Reorder team members
		case Task.reorder_team: {
			if (!state.current_team)
				return state;

			const new_party = action.data.map((value: any) => state.current_team?.pokemon[value]);
			const new_abilities = action.data.map((value: any) => state.current_team?.abilities[value]);
			return {
				...state,
				current_team: {
					...state.current_team,
					pokemon: new_party.slice(0, state.current_team?.pokemon.length),
					abilities: new_abilities.slice(0, state.current_team?.pokemon.length)
				}
			}
		}

		// Toggle the ability of a pokemon
		case Task.swap_ability: {
			if (!state.current_team)
				return state;

			// Find which pokemon is being targeted by the action
			const game = Data.getGame(state.current_team.game);
			const pokemon = state.current_team.pokemon;
			const abilities = state.current_team.abilities.slice();
			for (let i = 0; i < pokemon.length; ++i)
			{
				if (pokemon[i] === action.data)
				{
					// Cycle between ability slots, skipping slots with no ability
					const ability_data = Data.getPokemonAbilities(game.generation, pokemon[i].id, pokemon[i].form);
					const ability_slots = game.generation > 4 ? 2 : 1;
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

	console.error("Failed to apply action id: " + action.type);
	return state;
}

export const DispatchContext = createContext<ActionDispatch<[Action]>>(()=>{
	console.error("Invalid dispatch function.");
});