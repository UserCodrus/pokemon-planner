import PokemonData from "../data/pokemon.json";
import TypeData from "../data/types.json";
import AbilityData from "../data/ability.json";
import GameData from "../data/games.json";

// String representations of image folders
export const base_path = "";
const image_ext = ".png";

const type_sprite_location = base_path + "/images/types/";
const type_icon_location = base_path + "/images/types/icons/";
const pokemon_art_location = base_path + "/images/pokemon/art/";
const pokemon_sprite_location = base_path + "/images/pokemon/sprites/";
const game_logo_location = base_path + "/images/logos/";
const misc_location = base_path + "/images/";

const icon_location = base_path + "/icons.svg";

export const party_size = 6;
export const generations = 9;

/**
 * The current version of the app for tracking backwards compatibility
 */
export const app_data_version = "1.0";

const roman_numerals = [
	"I",
	"II",
	"III",
	"IV",
	"V",
	"VI",
	"VII",
	"VIII",
	"IX",
	"X"
];

/**
 * Information about an pokemon ability pulled from API data
 */
export type Ability = {
	name: string,
	defense?: {
		types: number[],
		multiplier: number,
		generation?: number
	}
}

/**
 * Information about a pokemon form pulled from API data
 */
export type Pokemon = {
	id: number,
	name: string,
	form: string,
	types: number[],

	sprite: string,
	art: string
}

/**
 * Information about a single version of a pokemon game
 */
export type Version = {
	name: string,				// The name of the game
	logo: string,				// The name of the game's logo image
	blacklist?: number[],		// Pokemon that shouldn't appear in the version
	formlist?: number[][],		// Pokemon forms that shouldn't appear in the version
	limit?: number				// A cutoff for pokedex entries - entries higher than this number will be blacklisted
}

/**
 * Information about each set of pokemon games
 */ 
export type Game = {
	id: string,
	pokedexes: string[],
	generation: number,
	name: string,
	versions: Version[],
	abilities: boolean
}

/**
 * Data for a single team slot
 */
export type TeamSlot = {
	id: number,
	form: number
};

/**
 * Data for a pokemon team
 */
export type Team = {
	id: number,
	game: string,
	name: string,
	pokemon: TeamSlot[],
	abilities: number[],
	created: Date,
	updated: Date
}

/**
 * A structure describing a button with that runs a callback function when clicked
 */
export type Button = {
	label: string,
	callback?: Function
}

/**
 * A structure describing a modal pop-up
 */
export type Modal = {
	message: string,
	buttons: Button[]
}



/**
 * A 1x1px transparent gif to use as a placeholder for missing images
 */
export const default_image = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/**
 * Get the URL for a type sprite
 * @param type The numeric ID of the type
 */
export function typeSpriteURL(type: number)
{
	return type_sprite_location + (type + 1).toString() + image_ext;
}

/**
 * Get the URL for a type icon
 * @param type The numeric ID of the type
 */
export function typeIconURL(type: number)
{
	return type_icon_location + (type + 1).toString() + image_ext;
}

/**
 * Get the URL for an image
 * @param filename The name of the image file
 */
export function imageURL(filename: string)
{
	return misc_location + filename;
}

/**
 * Get the URL for a game logo
 * @param filename The name of the logo file
 */
export function logoURL(filename: string)
{
	return game_logo_location + filename;
}

/**
 * Get the URL for an icon
 * @param name The symbol ID of the icon
 */
export function iconURL(name: string)
{
	return icon_location + "#" + name;
}

/**
 * Retrieve data for a given pokemon
 * @param generation The current generation the app is using
 * @param id The pokemon's national dex id
 * @param form The index of the pokemon's form
 */
export function getPokemon(generation: number, id: number, form?: number): Pokemon
{
	const pokemon = PokemonData[id];
	const selected_form = form ? pokemon.forms[form] : pokemon.forms[0];

	// Determine which types the pokemon should use based on the currently selected generation
	let current_type = {
		generation: 0,
		types: [0]
	};

	for (let i = 0; i < selected_form.types.length; ++i) {
		if (selected_form.types[i].generation >= generation) {
			current_type = selected_form.types[i];
			break;
		}
	}

	return {
		id: id,
		name: pokemon.name,
		form: selected_form.name,
		types: current_type.types,
		sprite: pokemon_sprite_location + selected_form.sprite,
		art: pokemon_art_location + selected_form.art
	}
}

/**
 * Get ability data for a pokemon in a given generation
 * @param generation The current generation the app is using
 * @param id The pokemon's national dex id
 * @param form The index of the pokemon's form
 */
export function getPokemonAbilities(generation: number, id: number, form?: number): number[]
{
	const pokemon = PokemonData[id];
	const selected_form = form ? pokemon.forms[form] : pokemon.forms[0];

	// Reconstruct the pokemon's abilities for the current generation by inserting data for legacy abilities
	const abilities = selected_form.abilities.slice();
	if (selected_form.past_abilities) {
		for (const legacy_ability of selected_form.past_abilities) {
			if (generation <= legacy_ability.generation)
				abilities[legacy_ability.slot] = legacy_ability.ability;
		}
	}

	return abilities;
}

/**
 * Get ability data from the json file
 */
export function getAbility(ability: number): Ability
{
	return AbilityData[ability];
}

/** 
 * Get the number of types the app supports
 */
export function getNumTypes(): number
{
	return TypeData.length;
}

/**
 * Determine if a given type exists in a particular generation
 * @param generation The current generation being used
 * @param type The numeric ID of the type in question
 */
export function validType(generation: number, type: number): boolean
{
	return TypeData[type].generation <= generation;
}

/**
 * Get the name of a type
 * @param type The numberic ID of the type
 */
export function getTypeName(type: number): string
{
	if (type < TypeData.length) {
		return TypeData[type].name;
	}

	return "unknown";
}

/** 
 * Determine if a particular type has an advantage against a different type
 * @param offensive_type The numeric ID of the type of the attack
 * @param defensive_type The numeric ID of the type of the defending pokemon
 */
export function getTypeAdvantage(generation: number, offensive_type: number, defensive_types: number[]): number
{
	let damage_multipliers: number[] = [];
	for (const damage_set of TypeData[offensive_type].damage) {
		if (damage_set.generation >= generation) {
			damage_multipliers = damage_set.multiplier;
			break;
		}
	}

	let final_multiplier = 1;
	for (const type of defensive_types) {
		final_multiplier *= damage_multipliers[type];
	}

	return final_multiplier;
}

/**
 * Convert a number into a roman numeral string
 * @param number The number being converted
 * @returns A string representation of the roman numeral form of the number
 */
export function getRomanNumeral(number: number): string
{
	if (number > 0 && number <= roman_numerals.length)
		return roman_numerals[number - 1];

	return "?";
}

/**
 * Get the game matching a given game id
 */
export function getGame(id: string): Game
{
	for (const game of GameData) {
		if (game.id === id)
			return game;
	}

	return GameData[0];
}

/**
 * Get the release order of a game
 */
export function getGameOrder(id: string): number
{
	for (let i = 0; i < GameData.length; ++i) {
		if (GameData[i].id === id)
			return i;
	}

	return -1;
}

/**
 * Get a serializable object using team data
 */
export function getTeamJSON(teams: Team[]): string
{
	// Wrap the team data in an object with some meta data
	const save_data = {
		meta: {
			version: app_data_version,
			saved: new Date()
		},
		teams: teams
	}

	return JSON.stringify(save_data);
}

/**
 * Throws an exception containing the name of a team and an error type
 */
function FormatTeamError(team_name: string, data_error:string)
{
	throw new Error("Team '" + team_name + "' contains " + data_error + ".");
}

/**
 * Convert a json file to a set of teams after checking for invalid data
 */
export async function loadTeamsFromJSON(file: File): Promise<Team[] | null>
{
	const data = JSON.parse(await file.text());
	const team: Team[] = [];

	// Check the version number of the exported data to ensure it isn't from an old version of the app
	if (data.meta && data.meta.version) {
		if (data.meta.version !== app_data_version)
			throw new Error("JSON file is from a depreciated version of the app.");
	} else {
		throw new Error("JSON file is missing metadata.");
	}

	// Validate each object in the team data array
	if (data.teams && Array.isArray(data.teams)) {
		for (const obj of data.teams) {
			if (typeof obj == "object") {
				// Check each objects properties to ensure they aren't missing any data
				if (typeof(obj.name) !== "string")
					throw new Error("JSON file contains team invalid data.");
				if (typeof(obj.id) !== "number")
					FormatTeamError(obj.name, "an invalid team ID");

				// Ensure the game ID is valid
				if (typeof(obj.game) !== "string")
					FormatTeamError(obj.name, "an invalid game ID");

				let valid = false;
				for (const game of GameData) {
					if (game.id === obj.game) {
						valid = true;
						break;
					}
				}

				if (!valid)
					FormatTeamError(obj.name, "an invalid game ID");
				
				// Check for valid date data
				const created_date = new Date(obj.created);
				if (isNaN(created_date.valueOf()))
					FormatTeamError(obj.name, "an invalid creation date");
				const updated_date = new Date(obj.updated);
				if (isNaN(updated_date.valueOf()))
					FormatTeamError(obj.name, "an invalid update date");

				// Check the pokemon array for invalid data
				if (typeof(obj.pokemon) !== "object" || !Array.isArray(obj.pokemon))
					FormatTeamError(obj.name, "invalid pokemon data");
				for (const pokemon of obj.pokemon){
					if (typeof(pokemon) !== "object")
						FormatTeamError(obj.name, "invalid pokemon data");
					if (typeof(pokemon.id) !== "number")
						FormatTeamError(obj.name, "invalid pokemon data");
					if (typeof(pokemon.form) !== "number")
						FormatTeamError(obj.name, "invalid pokemon data");
					if (pokemon.id < 0 || pokemon.id >= PokemonData.length)
						FormatTeamError(obj.name, "invalid pokemon data");

					const pokemon_data = PokemonData[pokemon.id];
					if (pokemon.form < 0 || pokemon.form >= pokemon_data.forms.length)
						FormatTeamError(obj.name, "invalid pokemon data");
				}

				if (typeof(obj.abilities) !== "object" || !Array.isArray(obj.abilities))
					FormatTeamError(obj.name, "invalid ability data");
				for (const ability of obj.abilities){
					if (typeof(ability) !== "number")
						FormatTeamError(obj.name, "invalid ability data");
				}

				// Insert a copy of the JSON data into the team data
				team.push({
					id: obj.id,
					game: obj.game,
					name: obj.name,
					pokemon: obj.pokemon.slice(),
					abilities: obj.abilities.slice(),
					created: created_date,
					updated: updated_date
				});
			} else {
				throw new Error("Invalid data in team array.");
			}
		}
	} else {
		throw new Error("JSON file is missing team data.");
	}

	return team;
}