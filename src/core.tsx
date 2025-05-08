'use client';

import { ReactElement, useState, useEffect, useReducer, Suspense, useContext } from "react";

import * as Components from "./components";
import * as Containers from "./containers";
import * as Data from "./data";
import { DispatchContext, newTeam, TeamContext, teamReducer, type Action } from "./reducer";
import { useSearchParams } from "next/navigation";

/**
 * Next.js won't let me use useSearchParams without a suspense wrapper. I don't know why I need this, it should only take a few nanoseconds for the browser to retrieve this information.
 */
export function StupidWrapper(): ReactElement
{
	return <Suspense>
		<App />
	</Suspense>
}

/**
 * The core component of the app, responsible for routing between different views
 */
export function App(): ReactElement
{
	// Get the current pokedex for the app using the url fragment
	const location = useSearchParams();
	let selected_game: Data.Game | undefined;
	for (const game of Data.game_list)
	{
		if (game.id === location.get("game"))
		{
			selected_game = game;
			break;
		}
	}

	const [data, dispatch] = useReducer(teamReducer, {
		game: selected_game ? selected_game : null,
		current_team: newTeam([]),
		teams: []
	});

	// Set the current game from the url fragment if it isn't already set
	if (!selected_game)
	{
		data.game = null;
		data.current_team = newTeam(data.teams);
	}
	else if (selected_game != data.game)
	{
		data.game = selected_game;
		data.current_team = newTeam(data.teams);
	}

	// Load saved teams from local storage
	/*useEffect(() => {
		const storage = localStorage.getItem("teams");
		if (storage)
		{
			setSavedTeams(JSON.parse(storage));
			console.log("Loaded team data from storage")
		}
		else
		{
			setSavedTeams([]);
		}
	}, []);

	// Save team data to storage every time it changes
	useEffect(() => {
		if (savedTeams && savedTeams.length > 0)
		{
			localStorage.setItem("teams", JSON.stringify(savedTeams));
			console.log("Saved team data to browser storage");
		}
	}, [savedTeams]);*/

	if (data.game)
	{
		return (
			<TeamContext.Provider value={data}>
				<DispatchContext.Provider value={dispatch}>
					<Planner />
				</DispatchContext.Provider>
			</TeamContext.Provider>
		);
	}
	else
	{
		return (
			<DispatchContext.Provider value={dispatch}>
				<Selector />
			</DispatchContext.Provider>
		);
	}
}

/**
 * The pokemon planner view
 */
export function Planner(): ReactElement
{
	//const [selectedPokemon, setSelectedPokemon] = useState<Data.TeamSlot[]>([]);
	const [typeFilter, setTypeFilter] = useState<boolean[]>(Array(Data.getNumTypes()).fill(true));
	const [nameFilter, setNameFilter] = useState<string>("");

	// Activate or deactivate a type filter option
	function toggleTypeFilter(type: number)
	{
		// Toggle all the types on or off if all is specified
		if (type === -1)
		{
			// If any types are disabled, enable everything
			for (const filter of typeFilter)
			{
				if (!filter)
				{
					setTypeFilter(Array(Data.getNumTypes()).fill(true));
				}
			}

			// If everything is enabled, disable everything
			setTypeFilter(Array(Data.getNumTypes()).fill(false));
			return;
		}

		// Toggle the state of the specified type filter
		const filter = typeFilter.slice();
		filter[type] = !filter[type];
		setTypeFilter(filter);
	}

	// Set the name filter for selectable pokemon
	function changeNameFilter(filter: string)
	{
		setNameFilter(filter);
	}

	return (
		<div className="flex flex-col w-4/5 py-8 gap-4 items-center">
			<Containers.PartyDisplay />
			<Containers.PartyAnalysis />
			<Containers.FilterBar typeFilter={typeFilter} name={nameFilter} onClickType={toggleTypeFilter} onChangeText={changeNameFilter} />
			<Containers.PokedexDisplay typeFilter={typeFilter} nameFilter={nameFilter} />
		</div>
	);
}

/**
 * The view that lets the player select a game to use
 */
export function Selector(): ReactElement
{
	// Create a set of pokedex selector components
	const components: ReactElement[] = [];
	for (let i = 0; i <= 9; ++i)
	{
		// Create a single row for each generation
		const inner_components: ReactElement[] = [];
		if (i === 0)
		{
			// Put the national dex at the top
			inner_components.push(<Components.PokedexSelector game={Data.game_list[0]} key={0} />);
		}
		else
		{
			let key = 0;
			for (const game of Data.game_list)
			{
				if (game.generation === i && game.id !== "nat")
				{
					inner_components.push(<Components.PokedexSelector game={game} key={key} />);
					++key;
					continue;
				}
			}
		}

		components.push(
			<div key={i} className="flex flex-row gap-2 justify-center">
				{inner_components}
			</div>
		);
	}

	return (
		<div className="flex flex-col flex-wrap gap-2 justify-evenly">
			{components}
		</div>
	);
}