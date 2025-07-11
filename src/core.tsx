'use client';

import { ReactElement, useState, useEffect, useReducer, useContext } from "react";

import * as Components from "./components";
import * as Containers from "./containers";
import * as Data from "./data";
import { DispatchContext, UnsafeDataContext, teamReducer, Task, View, compare_page, selector_page } from "./reducer";
import { ModalWrapper } from "./modal";
import GameData from "../data/games.json";
import Tutorials from "./tutorials";

// Start the app without team data to avoid issues with invalid team data
const debug = false;

/**
 * The core component of the app, responsible for routing between different views
 */
export function App(props: {page?: string}): ReactElement
{
	const [data, dispatch] = useReducer(teamReducer, {
		view: View.home,
		current_team: null,
		teams: null,
		team_updated: false
	});

	useEffect(() => {
		// Load teams from storage after the app starts
		const storage = localStorage.getItem("teams");
		if (storage && !debug) {
			// Restore date objects for loaded team data
			const team_data: Data.Team[] = JSON.parse(storage);
			for (const team of team_data) {
				team.created = new Date(team.created);
				team.updated = new Date(team.updated);
			}

			dispatch({
				type: Task.store_team_data,
				data: team_data
			});

			console.log("Loaded team data from storage");
		} else {
			dispatch({
				type: Task.store_team_data,
				data: []
			});
		}

		// Set the selected game if one was provided in the URL
		if (props.page) {
			if (props.page === compare_page)
				dispatch({
					type: Task.compare_view
				});

			else if (props.page === selector_page)
				dispatch({
					type: Task.game_view
				});

			else
				dispatch({
					type: Task.planner_view,
					data: props.page
				});
		}

		// Add an event listener for popstate to manage history
		window.addEventListener("popstate", (event) => {
			dispatch({
				type: Task.restory_history_state,
				data: event.state
			});
		});
	}, []);

	// Push any changes to team data to storage
	useEffect(() => {
		if (data.teams) {
			localStorage.setItem("teams", JSON.stringify(data.teams));
			console.log("Saved team data to browser storage");
		}
	}, [data.teams]);

	// Display a loading screen if team data has not been loaded yet
	if (!data.teams)
		return <Components.LoadingScreen />;

	// Set the current view component based on the view state
	let view: ReactElement = <div className="panel">Error: Invalid View</div>;
	switch (data.view) {
		// Display the landing page
		case View.home: {
			if (data.teams.length > 0)
				view = <TeamView teams={data.teams} selectedTeam={data.current_team} />;
			else
				view = <GameSelectorView />;
			break;
		};

		// Display the game selector
		case View.games: {
			view = <GameSelectorView />;
			break;
		};

		// Display the team planner
		case View.planner: {
			if (data.current_team)
				view = <PlannerView team={data.current_team} />;
			break;
		};

		// Display the team comparison page
		case View.compare: {
			view = <CompareView teams={data.teams} defaultTeam={data.current_team} />;
			break;
		};
	}

	// Display the app components
	return (
		<DispatchContext.Provider value={dispatch}>
			<UnsafeDataContext.Provider value={data.team_updated && data.current_team != null && data.current_team.pokemon.length > 0}>
				<ModalWrapper>
					<Containers.PopupMenu team={data.current_team} savedTeams={data.teams} />
					{view}
				</ModalWrapper>
			</UnsafeDataContext.Provider>
		</DispatchContext.Provider>
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

	const game = Data.getGame(props.team.game);

	// Activate or deactivate a type filter option
	function toggleTypeFilter(type: number, invert?: boolean) {
		// Toggle all the types on or off based on the invert flag if the type is set to -1
		if (type === -1) {
			setTypeFilter(Array(Data.getNumTypes()).fill(Boolean(invert)));
			return;
		}

		// Enable a single type if the invert flag is enabled
		if (invert) {
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
	function changeNameFilter(filter: string) {
		setNameFilter(filter);
	}

	function changeVersionFilter(version: number) {
		setVersionFilter(version);
	}

	return (
		<div className="flex flex-col min-w-[75%] max-w-[75%] lg:max-w-[90%] py-8 gap-4 items-stretch">
			<Components.ScrollButton />
			<Components.TeamName name={props.team.name} />
			<Containers.PartyDisplay pokemon={props.team.pokemon} abilities={props.team.abilities} game={game} tutorial={true} />
			<Containers.PartyAnalysis team={props.team.pokemon} abilities={props.team.abilities} game={game} tutorial={true} />
			<Containers.PokedexFilterBar game={game} typeFilter={typeFilter} name={nameFilter} version={versionFilter} tutorial={true} onClickType={toggleTypeFilter} onChangeText={changeNameFilter} onSelectVersion={changeVersionFilter} />
			<Containers.PokedexDisplay game={game} typeFilter={typeFilter} nameFilter={nameFilter} versionFilter={versionFilter} pokemon={props.team.pokemon} />
		</div>
	);
}

/**
 * The view that lets the player select a game to use
 */
function GameSelectorView(): ReactElement
{
	const [index, setIndex] = useState(0);

	// Set an interval function to control the logo animations for game selector components
	useEffect(() => {
		const interval_id = setInterval(() => {
			setIndex(value => value + 1);
		}, 2000);

		return () => clearInterval(interval_id);
	}, []);

	// Create a set of selector buttons for each available game
	let key = 0;
	const inner_components: ReactElement[] = [];
	for (const game of GameData)
	{
		inner_components.push(<Components.GameSelector game={game} logoCycle={index} key={key} />);
		++key;
	}

	return (
		<div className="flex flex-col items-center gap-2 max-w-[85%] lg:max-w-[75%]">
			<div className="panel text-lg text-center min-w-1/4">Select a Game</div>
			<div className="flex flex-row flex-wrap gap-2 justify-center items-center">
				{inner_components}
			</div>
		</div>
	);
}

/**
 * A view that compares the current team to a different team
 */
function CompareView(props: {teams: Data.Team[], defaultTeam: Data.Team | null}): ReactElement
{
	const unsafe = useContext(UnsafeDataContext);
	const [primaryTeam, setPrimaryTeam] = useState<Data.Team | null>(props.defaultTeam);
	const [secondaryTeam, setSecondaryTeam] = useState<Data.Team | undefined>();

	const primary_game = primaryTeam ? Data.getGame(primaryTeam.game) : null;
	const secondary_game = secondaryTeam ? Data.getGame(secondaryTeam.game) : null;

	// Create a list of selectable teams
	const primary_selector: ReactElement[] = [];
	const secondary_selector: ReactElement[] = [];
	let primary_key = 0;
	let secondary_key = 0;

	// Add the current team to the selector if the user has an unsaved current team
	if (props.defaultTeam && unsafe) {
		primary_selector.push(<li className="clickable" key={primary_key} onClick={() => {
				setPrimaryTeam(props.defaultTeam);
				setSecondaryTeam(undefined);
			}}>{"[Current Team]"}</li>);
	}
	
	for (const team of props.teams) {
		// Add each team to the primary team selector
		primary_selector.push(<li className="clickable" key={primary_key} onClick={() => {
			setPrimaryTeam(team);
			setSecondaryTeam(undefined);
		}}>{team.name}</li>);
		primary_key++;

		// Add secondary teams if a primary team is selected
		if (primaryTeam && primary_game) {
			const game = Data.getGame(team.game);
			if (game.generation === primary_game.generation) {
				secondary_selector.push(<li className="clickable" key={secondary_key} onClick={() => setSecondaryTeam(team)}>{team.name}</li>);
				secondary_key++;
			}
		}
	}

	return (
		<div className="flex flex-col py-8 gap-4 items-stretch w-4/5">
			<div className="flex flex-col lg:flex-row gap-4 justify-center">
				<div className="flex items-center justify-center">
					<Containers.PopupBox text={primaryTeam ? primaryTeam.name : "Select a team"} >
						<ul className="popup top-full left-0 mt-[2px] min-w-full anim-grow">{primary_selector}</ul>
					</Containers.PopupBox>
				</div>
				<div className="flex items-center justify-center relative">
					<Containers.PopupBox text={secondaryTeam ? secondaryTeam.name : "Select a team"} disabled={!primaryTeam} >
						<ul className="popup top-full left-0 mt-[2px] min-w-full anim-grow">{secondary_selector}</ul>
					</Containers.PopupBox>
				</div>
			</div>

			{primaryTeam && <div className="flex flex-col gap-4">
				<Containers.PartyDisplay pokemon={primaryTeam.pokemon} abilities={primaryTeam.abilities} game={primary_game!} />
				<Containers.PartyAnalysis team={primaryTeam.pokemon} compareTeam={secondaryTeam?.pokemon} abilities={primaryTeam.abilities} compareAbilities={secondaryTeam?.abilities} game={primary_game!} altTutorial={true} />
			</div>}
			
			{secondaryTeam && <div className="flex flex-col gap-4">
				<Containers.PartyAnalysis team={secondaryTeam.pokemon} compareTeam={primaryTeam?.pokemon} abilities={secondaryTeam.abilities} compareAbilities={primaryTeam?.abilities} game={secondary_game!} />
				<Containers.PartyDisplay pokemon={secondaryTeam.pokemon} abilities={secondaryTeam.abilities} game={secondary_game!} />
			</div>}

		</div>
	);
}

/**
 * The view that lets the player select an existing team to edit
 */
function TeamView(props: {teams: Data.Team[], selectedTeam: Data.Team | null}): ReactElement
{
	const [generationFilter, setGenerationFilter] = useState(Array(9).fill(true));
	const [sortAction, setSortAction] = useState<Components.PartySort>(Components.sort_options[0]);
	const [sortAscending, setSortAscending] = useState(true);

	// Change the generation filter when a filter button is clicked
	function selectGeneration(generation: number, invert?: boolean) {
		// Toggle all the types on or off based on the invert flag if the type is set to -1
		if (generation === -1) {
			setGenerationFilter(Array(Data.getNumTypes()).fill(Boolean(invert)));
			return;
		}

		// Enable a single type if the invert flag is enabled
		if (invert) {
			const filter = Array(Data.getNumTypes()).fill(false);
			filter[generation] = true;
			setGenerationFilter(filter);
			return;
		}

		// Toggle the state of the specified type filter
		const filter = generationFilter.slice();
		filter[generation] = !filter[generation];
		setGenerationFilter(filter);
	}

	// Sort team data according to the selected filter
	let team_data = props.teams.slice();
	if (sortAction) {
		team_data.sort((a, b) => {
			if (sortAscending)
				return sortAction.sort(a, b);
			else
				return -sortAction.sort(a, b);
		});
	}

	// Create a set of party selector components
	const party_components: ReactElement[] = [];
	for (let i = 0; i < team_data.length; ++i) {
		if (generationFilter[Data.getGame(team_data[i].game).generation - 1])
			party_components.push(<Containers.PartySelector party={team_data[i]} currentParty={false} key={i} />);
	}

	return (
		<div className="flex flex-col min-w-4/5 max-w-[80%] lg:max-w-[90%] py-8 gap-4 justify-center items-stretch">
			{props.selectedTeam &&<div className="flex flex-col gap-4 items-center">
				{<div className="text-center panel inline-block grow-0">Current Party</div>}
				<Containers.PartySelector party={props.selectedTeam} currentParty={true} />
			</div>}
			<Containers.TeamFilterBar generationFilter={generationFilter} sortType={sortAction} sortAscending={sortAscending} tutorial={true}
				onSelectPartySort={setSortAction} onSelectGeneration={selectGeneration} onSwitchSortOrder={() => setSortAscending(!sortAscending)} />
			<div className="flex flex-row flex-wrap gap-2 justify-between items-center">
				{party_components}
			</div>
		</div>
	);
}

/**
 * A page that that prompts the user to reset their team data
 */
export function ResetView(): ReactElement
{
	return (<div className="flex flex-col min-w-4/5 max-w-[80%] lg:max-w-[90%] py-8 gap-4 justify-center items-center">
		<ModalWrapper>
			<Containers.ResetPanel />
		</ModalWrapper>
	</div>);
}