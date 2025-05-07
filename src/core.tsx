'use client';

import { ReactElement, useState, useEffect, useReducer, Suspense } from "react";

import * as Components from "./components";
import * as Containers from "./containers";
import * as Data from "./data";
import { DispatchContext, TeamContext, teamReducer, type Action } from "./reducer";
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
	const [team, dispatch] = useReducer(teamReducer, {
		id: 0,
		name: "New Team",
		pokedex: "nat",
		pokemon: []
	});

	// Get the current pokedex for the app using the url fragment
	const location = useSearchParams();
	let selectedGame: Data.Game | undefined;
	for (const game of Data.game_list)
	{
		if (game.id === location.get("game"))
		{
			selectedGame = game;
			break;
		}
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

	if (selectedGame)
	{
		return (
			<TeamContext.Provider value={team}>
				<DispatchContext.Provider value={dispatch}>
					<Planner team={team} />
				</DispatchContext.Provider>
			</TeamContext.Provider>
		);
	}
	else
	{
		return (
			<Selector />
		);
	}
}

/**
 * The pokemon planner view
 */
export function Planner(props: {team: Data.Team}): ReactElement
{
	//const [selectedPokemon, setSelectedPokemon] = useState<Data.TeamSlot[]>([]);
	const [typeFilter, setTypeFilter] = useState<boolean[]>(Array(Data.getNumTypes()).fill(true));
	const [nameFilter, setNameFilter] = useState<string>("");

	// Get the current pokedex for the app using the url fragment
	const location = useSearchParams();
	let selectedGame: Data.Game = Data.game_list[0];
	for (const game of Data.game_list)
	{
		if (game.id === location.get("game"))
		{
			selectedGame = game;
			break;
		}
	}

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
			<Containers.PartyDisplay generation={selectedGame.generation} />
			<Containers.PartyAnalysis generation={selectedGame.generation} />
			<Containers.FilterBar generation={selectedGame.generation} typeFilter={typeFilter} name={nameFilter} onClickType={toggleTypeFilter} onChangeText={changeNameFilter} />
			<Containers.PokedexDisplay generation={selectedGame.generation} pokedexes={selectedGame.pokedexes} typeFilter={typeFilter} nameFilter={nameFilter} />
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