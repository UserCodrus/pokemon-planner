'use client';

import { ReactElement, useState, useEffect, useReducer, useContext } from "react";

import * as Components from "./components";
import * as Containers from "./containers";
import * as Data from "./data";
import { DispatchContext, newTeam, teamReducer, GameContext, Task } from "./reducer";

/**
 * The core component of the app, responsible for routing between different views
 */
export function App(): ReactElement
{
	const [data, dispatch] = useReducer(teamReducer, {
		game: null,
		current_team: newTeam([], ""),
		teams: []
	});

	// Load teams from storage after the app starts
	useEffect(() => {
		const storage = localStorage.getItem("teams");
		if (storage)
		{
			dispatch({
				type: Task.load_teams,
				data: JSON.parse(storage)
			});
			console.log("Loaded team data from storage");
			console.log(JSON.parse(storage));
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

	if (data.game)
	{
		return (
			<GameContext.Provider value={data.game}>
				<DispatchContext.Provider value={dispatch}>
					<Planner team={data.current_team}/>
				</DispatchContext.Provider>
			</GameContext.Provider>
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
export function Planner(props: {team: Data.Team}): ReactElement
{
	const dispatch = useContext(DispatchContext);

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
			<div>
				<button className="panel p-2 m-1 clickable" onClick={()=>{
					dispatch({
						type: Task.save_current_team
					});
				}}>Save team</button>
				<button className="panel p-2 m-1 clickable" onClick={()=>{
					dispatch({
						type: Task.save_new_team
					});
				}}>Save as new</button>
				<button className="panel p-2 m-1 clickable" onClick={()=>{
					dispatch({
						type: Task.new_team
					});
				}}>New team</button>
				<button className="panel p-2 m-1 clickable" onClick={()=>{
					dispatch({
						type: Task.select_team,
						data: 1
					});
				}}>Load team</button>
			</div>
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