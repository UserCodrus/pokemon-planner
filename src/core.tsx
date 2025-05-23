'use client';

import { ReactElement, useState, useEffect, useReducer, useContext } from "react";

import * as Components from "./components";
import * as Containers from "./containers";
import * as Data from "./data";
import { DispatchContext, teamReducer, GameContext, Task, View } from "./reducer";

// Start the app without team data to avoid issues with invalid team data
const debug = false;

/**
 * The core component of the app, responsible for routing between different views
 */
export function App(): ReactElement
{
	const [data, dispatch] = useReducer(teamReducer, {
		view: View.home,
		game: null,
		current_team: null,
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

	// Display a loading screen if team data has not been loaded yet
	if (!data.teams)
		return (
			<div className="panel">
				Loading...
			</div>
		);

	switch (data.view)
	{
		// Display the landing page
		case View.home: {
			return (
				<DispatchContext.Provider value={dispatch}>
					{data.modal && <Components.ModalBox modalData={data.modal} />}
					<SelectorView teams={data.teams} selectedTeam={data.current_team} />
				</DispatchContext.Provider>
			);
		};

		// Display the team planner
		case View.planner: {
			if (data.current_team)
				return (
					<GameContext.Provider value={data.game}>
						<DispatchContext.Provider value={dispatch}>
							{data.modal && <Components.ModalBox modalData={data.modal} />}
							<PlannerView team={data.current_team}/>
						</DispatchContext.Provider>
					</GameContext.Provider>
				);
		};

		// Display the team comparison page
		case View.compare: {
			if (data.current_team)
				return (
					<GameContext.Provider value={data.game}>
						<DispatchContext.Provider value={dispatch}>
							{data.modal && <Components.ModalBox modalData={data.modal} />}
							<CompareView teams={data.teams} selectedTeam={data.current_team} />
						</DispatchContext.Provider>
					</GameContext.Provider>
				);
		};
	}

	// Fallback if anything goes wrong
	return (
		<div className="panel">
			Error, try again later.
		</div>
	);
}

/**
 * The pokemon planner view
 */
function PlannerView(props: {team: Data.Team}): ReactElement
{
	const [typeFilter, setTypeFilter] = useState<boolean[]>(Array(Data.getNumTypes()).fill(true));
	const [nameFilter, setNameFilter] = useState<string>("");
	const [versionFilter, setVersionFilter] = useState<number>(-1);

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

	function changeVersionFilter(version: number)
	{
		setVersionFilter(version);
	}

	return (
		<div className="flex flex-col min-w-4/5 max-w-[90%] py-8 gap-4 items-stretch">
			<Containers.PopupMenu />
			<Components.TeamName name={props.team.name} />
			<Containers.PartyDisplay pokemon={props.team.pokemon} abilities={props.team.abilities} />
			<Containers.PartyAnalysis pokemon={props.team.pokemon} abilities={props.team.abilities} />
			<Containers.FilterBar typeFilter={typeFilter} name={nameFilter} version={versionFilter} onClickType={toggleTypeFilter} onChangeText={changeNameFilter} onSelectVersion={changeVersionFilter} />
			<Containers.PokedexDisplay typeFilter={typeFilter} nameFilter={nameFilter} versionFilter={versionFilter} pokemon={props.team.pokemon} />
		</div>
	);
}

/**
 * The view that lets the player select a game to use
 */
function SelectorView(props: {teams: Data.Team[], selectedTeam: Data.Team | null}): ReactElement
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
			{props.selectedTeam && <div><div className="text-center panel m-2">Current Party:</div><Containers.PartySelector party={props.selectedTeam} /></div>}
			<div className="flex flex-col flex-wrap gap-2 justify-evenly py-4">
				{party_components}
			</div>
			<div className="flex flex-col flex-wrap gap-2 justify-evenly">
				{pokedex_components}
			</div>
		</div>
	);
}

/**
 * A view that compares the current team to a different team
 */
function CompareView(props: {teams: Data.Team[], selectedTeam: Data.Team}): ReactElement
{
	const [compareTeam, setCompareTeam] = useState<Data.Team>();

	// Create a list of selectable teams
	const team_components: ReactElement[] = [];
	let key = 0;
	for (const team of props.teams)
	{
		const game = Data.getGame(team.game);
		const current_game = Data.getGame(props.selectedTeam.game);

		if (game.generation === current_game.generation)
		{
			team_components.push(<li className="clickable" key={key} onClick={() => setCompareTeam(team)}>{team.name}</li>);
			key++;
		}
	}

	return (
		<div className="flex flex-col py-8 gap-4 items-stretch w-4/5">
			<Containers.PopupMenu />
			<Components.TeamName name={props.selectedTeam.name} />
			<Containers.PartyDisplay pokemon={props.selectedTeam.pokemon} abilities={props.selectedTeam.abilities} />
			<Containers.PartyAnalysis pokemon={props.selectedTeam.pokemon} abilities={props.selectedTeam.abilities} />

			<div className="flex items-center justify-center">
				<Containers.PopupBox text={compareTeam ? compareTeam.name : "Select a team"} >
					<ul className="popup top-full left-0 mt-[2px] min-w-full anim-grow">{team_components}</ul>
				</Containers.PopupBox>
			</div>

			{compareTeam && <div className="flex flex-col gap-4">
				<Containers.PartyAnalysis pokemon={compareTeam.pokemon} abilities={compareTeam.abilities} />
				<Containers.PartyDisplay pokemon={compareTeam.pokemon} abilities={compareTeam.abilities} />
			</div>}

		</div>
	);
}