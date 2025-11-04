import * as Data from "./data";

import { ActionDispatch, createContext } from "react";

/**
 * Various actions that can be performed in the app via the reducer
 */
export const enum Task {
	/**
	 * Switch to the view that allows the user to select a saved team to use.
	 */
	team_view,
	/**
	 * Switches to the view that allows the user to select a game for the team planner.
	 */
	game_view,
	/**
	 * Switches to the view that allows the user to compare saved teams.
	 */
	compare_view,
	/**
	 * Change the selected game and move to the team planner view.
	 * @see Action.data A game id matching a game in Data.game_list.
	 */
	planner_view,
	/**
	 * Reset the app's state to match a historic state provided by a popstate event.
	 * @see Action.data An object containing the view and party states.
	 */
	restory_history_state,
	/**
	 * Store a set of teams.
	 * @see Action.data An array of Data.Team objects.
	 */
	store_team_data,

	/**
	 * Overwrite changes made to the current team.
	 */
	save_current_team,
	/**
	 * Save the current team to a new slot, assigning it a new id.
	 */
	save_new_team,
	/**
	 * Delete the current team and create a new one.
	 */
	new_team,
	/**
	 * Sets the team with a matching id to the current team.
	 * @see Action.data A number corresponding to a team id. If data is not provided, the current team will be reloaded.
	 */
	select_team,
	/**
	 * Delete a team from the team list.
	 * @see Action.data The team id of the team being deleted.
	 */
	delete_team,
	/**
	 * Export saved teams to a JSON file and allow the user to download it
	 */
	export_teams,
	/**
	 * Import team data from a JSON file
	 * @see Action.data The File object containing JSON data
	 */
	import_teams,

	/**
	 * Change the name of the current team.
	 * @see Action.data A string corresponding to the new team name.
	 */
	change_name,
	/**
	 * Add a pokemon to the current team, or remove it if it has already been added.
	 * @see Action.data A TeamSlot object corresponding to the new pokemon.
	 */
	select_pokemon,
	/**
	 * Change the order of the current party.
	 * @see Action.data An array containing the indices of each team member in the current party.
	 */
	reorder_team,
	/**
	 * Toggle a team member's ability.
	 * @see Action.data A TeamSlot object with an id and form matching a party member.
	 */
	swap_ability
}

/**
 * The page name for the compare view
 */
export const compare_page = "compare";
/**
 * The page name for the game selector view
 */
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
 * Global data for the app, stored in the top level component
 * @param view The currently visible view
 * @param current_team The team the user is currently editing
 * @param teams The teams the user has saved to storage
 * @param team_updated A flag that determines if the app has unsaved changes
 */
export type AppData = {
	view: View,
	current_team: Data.Team | null,
	teams: Data.Team[] | null,
	team_updated: boolean
};

// Create a new team for the app
function newTeam(teams: Data.Team[], game: string): Data.Team {
	// Get the last team id used by existing teams
	let team_id = 0;
	for (const team of teams) {
		if (team.id > team_id)
			team_id = team.id;
	}

	return {
		id: team_id + 1,
		game: game,
		name: "New Team",
		pokemon: [],
		abilities: [],
		created: new Date(),
		updated: new Date()
	}
}

// Get the url segment of the current view
function getURLSegment(view: View, game?: string): string {
	switch (view) {
		case View.home: return "";
		case View.compare: return "compare";
		case View.games: return "games";
		case View.planner:  return (game ? game : "nat");
	}
}

// Load teams from storage
function loadTeams() {
	const storage = localStorage.getItem("teams");
	if (storage) {
		const team_data: Data.Team[] = JSON.parse(storage);
		for (const team of team_data) {
			team.created = new Date(team.created);
			team.updated = new Date(team.updated);
		}
		return team_data;
	}

	return null;
}

/**
 * A function that saves the state of the app when the view is switched and the url changes
 * @param current_state The current state of the app
 * @param new_state The state that the app is switching to
 * @param page The url segment of the current page
 * @param force If set to true, the app will push to history even if the url hasn't changed
 */
function saveHistory(current_state: AppData, new_state: AppData, page: string, force?: boolean)
{
	// Update the current state of the app before pushing a new state
	const update_state = {
		view: current_state.view,
		team: structuredClone(current_state.current_team)
	};
	history.replaceState(update_state, "");

	// Add the new state to browser history if the URL has changed
	const url = window.location.origin + Data.base_path + "/" + page;
	if (url != window.location.href || force) {
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
export function teamReducer(state: AppData, action: Action): AppData
{
	switch (action.type) {
		// Switch to the home view
		case Task.team_view: {
			// Pull team data from storage to keep data synced
			let user_teams = loadTeams();
			if (!user_teams)
				user_teams = state.teams;

			window.scrollTo(0, 0);
			const new_state = {
				...state,
				view: View.home,
				teams: user_teams,
			};

			saveHistory(state, new_state, getURLSegment(new_state.view, state.current_team?.game));
			return new_state;
		};

		// Switch to the game selector view
		case Task.game_view: {
			// Pull team data from storage to keep data synced
			let user_teams = loadTeams();
			if (!user_teams)
				user_teams = state.teams;

			window.scrollTo(0, 0);
			const new_state = {
				...state,
				view: View.games,
				teams: user_teams,
			};

			saveHistory(state, new_state, getURLSegment(new_state.view, state.current_team?.game));
			return new_state;
		}

		// Switch to the compare view
		case Task.compare_view: {
			// Pull team data from storage to keep data synced
			let user_teams = loadTeams();
			if (!user_teams)
				user_teams = state.teams;

			window.scrollTo(0, 0);
			const new_state = {
				...state,
				view: View.compare,
				teams: user_teams,
			};

			saveHistory(state, new_state, getURLSegment(new_state.view, state.current_team?.game));
			return new_state;
		};

		// Find a game matching the provided id and set the planner view
		case Task.planner_view: {
			if (!action.data)
				return {
					...state,
					view: View.home
				}

			// Pull team data from storage to keep data synced
			let user_teams = loadTeams();
			if (!user_teams) {
				if (!state.teams)
					break;

				user_teams = state.teams;
			}

			const selected_game = Data.getGame(action.data);
			if (selected_game) {
				window.scrollTo(0, 0);
				const new_state = {
					...state,
					teams: user_teams,
					current_team: newTeam(user_teams, selected_game.id),
					view: View.planner,
					updated: false
				};

				saveHistory(state, new_state, getURLSegment(new_state.view, selected_game.id));
				return new_state;
			}
		};

		// Restore the state provided by the popstate event
		case Task.restory_history_state: {
			if (action.data.view !== undefined) {
				return {
					...state,
					view: action.data.view,
					current_team: structuredClone(action.data.team),
					team_updated: action.data.updated
				};
			} else {
				return {
					...state,
					view: View.home,
					current_team: null,
					team_updated: action.data.updated
				};
			}
		}

		// Overwrite the current team data with the provided teams
		case Task.store_team_data: {
			return {
				...state,
				teams: action.data as Data.Team[]
			}
		};

		// Store changes made to the current team
		case Task.save_current_team: {
			// Pull team data from storage to keep data synced
			let user_teams = loadTeams();
			if (!user_teams)
				user_teams = state.teams;

			if (!user_teams || !state.current_team)
				break;

			// Remove the team from its current spot in the team list if it has already been saved
			const team_list = user_teams.slice();
			for (let i = 0; i < team_list.length; ++i) {
				if (team_list[i].id === state.current_team.id) {
					team_list.splice(i, 1);
					break;
				}
			}

			// Add the team data back into the team list after updating the updated timestamp
			const new_team = structuredClone(state.current_team);
			new_team.updated = new Date();
			team_list.push(new_team);

			return {
				...state,
				teams: team_list,
				team_updated: false
			};
		};

		// Store the current team to the team list as a new team
		case Task.save_new_team: {
			// Pull team data from storage to keep data synced
			let user_teams = loadTeams();
			if (!user_teams)
				user_teams = state.teams;

			if (!user_teams || !state.current_team)
				break;

			// Get an unused team id
			const team_list = user_teams.slice();
			let team_id = 0;
			for (const team of team_list) {
				if (team.id > team_id)
					team_id = team.id;
			}

			// Copy the team data and add it to the team list
			const new_team = structuredClone(state.current_team);
			new_team.id = team_id + 1;
			new_team.created = new Date();
			new_team.updated = new Date();
			team_list.push(new_team);
			return {
				...state,
				current_team: new_team,
				teams: team_list,
				team_updated: false
			};
		};

		// Reset the active team
		case Task.new_team: {
			// Pull team data from storage to keep data synced
			let user_teams = loadTeams();
			if (!user_teams) {
				if (!state.teams)
					break;

				user_teams = state.teams;
			}
			
			const new_team = newTeam(user_teams, state.current_team ? state.current_team.game : "nat");
			const new_state = {
				...state,
				view: View.planner,
				current_team: new_team,
				updated: false
			}

			saveHistory(state, new_state, getURLSegment(new_state.view, state.current_team?.game), true);

			return new_state;
		};

		// Set the team with the given id as the active team and load the planner
		case Task.select_team: {
			// Pull team data from storage to keep data synced
			let user_teams = loadTeams();
			if (!user_teams) {
				if (!state.teams)
					break;

				user_teams = state.teams;
			}
			
			let selected_team: Data.Team | null = null;
			if (state.current_team && !action.data) {
				// If the selected team is the same as the current team, skip searching for teams
				selected_team = state.current_team;
			} else {
				// Searth the team list to find a team with a matching id
				const team_list = user_teams.slice();
				for (const team of team_list) {
					if (team.id === action.data) {
						selected_team = structuredClone(team);
						break;
					}
				}
			}

			if (!selected_team)
				break;

			const selected_game = Data.getGame(selected_team.game);
			if (selected_game) {
				window.scrollTo(0, 0);
				const new_state = {
					...state,
					game: selected_game,
					current_team: selected_team,
					view: View.planner,
					updated: false
				}
				saveHistory(state, new_state, getURLSegment(new_state.view, selected_game.id));

				return new_state;
			}
		};

		// Find a team in the team list and remove it
		case Task.delete_team: {
			// Pull team data from storage to keep data synced
			let user_teams = loadTeams();
			if (!user_teams) {
				if (!state.teams)
					break;

				user_teams = state.teams;
			}

			const team_list = user_teams.slice();
			const team_index = team_list.findIndex((value)=>value.id === action.data);

			if (team_index > -1) {
				team_list.splice(team_index, 1);
				return {
					...state,
					teams: team_list
				}
			}
		};

		// Export team data
		case Task.export_teams: {
			// Pull team data from storage to keep data synced
			let user_teams = loadTeams();
			if (!user_teams) {
				if (!state.teams)
					break;

				user_teams = state.teams;
			}
			
			const filename = "Pokémon Teams.json";
			const type = "application/json;charset=utf-8;";

			// Create a link element and insert team data as a link payload
			const link = document.createElement('a');
			link.download = filename;
			link.href = "data:" + type + "," + encodeURIComponent(Data.getTeamJSON(user_teams));
			link.target = "_blank";

			// Attach the payload and click it
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			return state;
		};

		// Import team data
		case Task.import_teams: {
			return {
				...state,
				view: View.home,
				current_team: null,
				teams: action.data as Data.Team[],
				team_updated: false
			};
		};

		// Set the name of the team to the data payload
		case Task.change_name: {
			if (!state.current_team)
				break;

			return {
				...state,
				team_updated: true,
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
			for (let i=0; i < pokemon.length; ++i) {
				if (pokemon[i].id === action.data.id && pokemon[i].form === action.data.form) {
					pokemon.splice(i, 1);
					abilities.splice(i, 1);
					return {
						...state,
						team_updated: true,
						current_team: {
							...state.current_team,
							pokemon: pokemon,
							abilities: abilities
						}
					};
				}
			}

			// Add the pokemon to the party
			if (pokemon.length < 6) {
				pokemon.push({id: action.data.id, form: action.data.form});
				abilities.push(0);
				return {
					...state,
					team_updated: true,
					current_team: {
						...state.current_team,
						pokemon: pokemon,
						abilities: abilities
					}
				};
			}

			return state;
		};

		// Reorder team members
		case Task.reorder_team: {
			if (!state.current_team)
				return state;

			const new_party = action.data.map((value: any) => state.current_team?.pokemon[value]);
			const new_abilities = action.data.map((value: any) => state.current_team?.abilities[value]);
			return {
				...state,
				team_updated: true,
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
			for (let i = 0; i < pokemon.length; ++i) {
				if (pokemon[i] === action.data) {
					// Cycle between ability slots, skipping slots with no ability
					const ability_data = Data.getPokemonAbilities(game.generation, pokemon[i].id, pokemon[i].form);
					const ability_slots = game.generation > 4 ? 2 : 1;
					do {
						abilities[i]++;
						if (abilities[i] > ability_slots)
							abilities[i] = 0;
					} while (!ability_data[abilities[i]]);
				}
			}

			return {
				...state,
				team_updated: true,
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

/**
 * The context that handles the main action dispatch for the app
 */
export const DispatchContext = createContext<ActionDispatch<[Action]>>(()=>{
	console.error("Invalid dispatch function.");
});

/**
 * This context contains a flag indicating whether or not it is safe to overwrite user data.
 * If the flag is set to true, a prompt should be used before dispatching any action that deletes the user's current party,
 * e.g. new_team, select_team
 */
export const UnsafeDataContext = createContext<boolean>(false);