'use client';

import { ReactElement, useState, useEffect, useReducer, useContext } from "react";

import * as Components from "./components";
import * as Containers from "./containers";
import * as Data from "./data";
import { DispatchContext, newTeam, teamReducer, GameContext, Task } from "./reducer";

// Start the app without team data to avoid issues with invalid team data
const debug = false;

/**
 * The core component of the app, responsible for routing between different views
 */
export function App(): ReactElement
{
	const [data, dispatch] = useReducer(teamReducer, {
		game: null,
		current_team: newTeam([], ""),
		teams: null,
		modal: null
	});

	// Load teams from storage after the app starts
	useEffect(() => {
		const storage = localStorage.getItem("teams");
		if (storage && !debug)
		{
			dispatch({
				type: Task.load_teams,
				data: JSON.parse(storage)
			});
			console.log("Loaded team data from storage");
		}
		else
		{
			dispatch({
				type: Task.load_teams,
				data: []
			});
		}
	}, []);

	// Push any changes to team data to storage
	useEffect(() => {
		if (data.teams && data.teams.length > 0)
		{
			localStorage.setItem("teams", JSON.stringify(data.teams));
			console.log("Saved team data to browser storage");
		}
	}, [data.teams]);

	if (!data.teams)
	{
		// Display a loading screen if team data has not been loaded yet
		return (
			<div className="panel">
				Loading...
			</div>
		);
	}
	if (!data.game)
	{
		// Display the game selector if no game is selected
		return (
			<DispatchContext.Provider value={dispatch}>
				<Selector teams={data.teams} />
			</DispatchContext.Provider>
		);
	}

	return (
		<GameContext.Provider value={data.game}>
			<DispatchContext.Provider value={dispatch}>
				{data.modal && <Components.ModalBox modalData={data.modal} />}
				<Planner team={data.current_team}/>
			</DispatchContext.Provider>
		</GameContext.Provider>
	);
}

/**
 * The pokemon planner view
 */
export function Planner(props: {team: Data.Team}): ReactElement
{
	//const [selectedPokemon, setSelectedPokemon] = useState<Data.TeamSlot[]>([]);
	const [typeFilter, setTypeFilter] = useState<boolean[]>(Array(Data.getNumTypes()).fill(true));
	const [nameFilter, setNameFilter] = useState<string>("");

	// Activate or deactivate a type filter option
	function toggleTypeFilter(type: number, whitelist?: boolean)
	{
		// Toggle all the types on or off based on the whitelist flag if the type is set to -1
		if (type === -1)
		{
			setTypeFilter(Array(Data.getNumTypes()).fill(Boolean(whitelist)));
			return;
		}

		// Enable a single type if the whitelist flag is enabled
		if (whitelist)
		{
			const filter = Array(Data.getNumTypes()).fill(false);
			filter[type] = true;
			setTypeFilter(filter);
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
		<div className="flex flex-col w-4/5 py-8 gap-4 items-stretch">
			<Containers.PopupMenu />
			<Components.TeamName name={props.team.name} />
			<Containers.PartyDisplay pokemon={props.team.pokemon} abilities={props.team.abilities} />
			<Containers.PartyAnalysis pokemon={props.team.pokemon} abilities={props.team.abilities} />
			<Containers.FilterBar typeFilter={typeFilter} name={nameFilter} onClickType={toggleTypeFilter} onChangeText={changeNameFilter} />
			<Containers.PokedexDisplay typeFilter={typeFilter} nameFilter={nameFilter} pokemon={props.team.pokemon} />
		</div>
	);
}

/**
 * The view that lets the player select a game to use
 */
export function Selector(props: {teams: Data.Team[]}): ReactElement
{
	// Create a set of party selector components
	const party_components: ReactElement[] = [];
	for (let i = 0; i < props.teams.length; ++i)
	{
		party_components.push(<Containers.PartySelector party={props.teams[i]} key={i} />);
	}

	// Create a set of pokedex selector components
	const pokedex_components: ReactElement[] = [];
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

		pokedex_components.push(
			<div key={i} className="flex flex-row gap-2 justify-center">
				{inner_components}
			</div>
		);
	}

	return (
		<div>
			<div className="flex flex-col flex-wrap gap-2 justify-evenly py-4">
				{party_components}
			</div>
			<div className="flex flex-col flex-wrap gap-2 justify-evenly">
				{pokedex_components}
			</div>
		</div>
	);
}