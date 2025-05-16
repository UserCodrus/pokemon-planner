import PokemonData from "../data/pokemon.json";
import TypeData from "../data/types.json";
import AbilityData from "../data/ability.json";

// String representations of image folders
const image_ext = ".png";
const type_sprite_location = "/images/types/";
const type_icon_location = "/images/types/icons/";
const pokemon_art_location = "/images/pokemon/art/";
const pokemon_sprite_location = "/images/pokemon/sprites/";
const misc_location = "/images/";

export const party_size = 6;
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
	types: number[],

	sprite: string,
	art: string
}

/**
 * Information about a single version of a pokemon game
 */
export type Version = {
	name: string,			// The name of the game
	blacklist?: number[]	// Pokemon that shouldn't appear in the game
}

/**
 * Information about each set of pokemon games
 */ 
export type Game = {
	id: string,
	pokedexes: string[],
	generation: number,
	name: string,
	versions: Version[]
}

/**
 * Data for a single team slot
 */
export type TeamSlot = {
	id: number,
	form?: number
};

/**
 * Data for a pokemon team
 */
export type Team = {
	id: number,
	game: string,
	name: string,
	pokemon: TeamSlot[],
	abilities: number[]
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
 * The master list of pokedexes and their generations used in each game
 */
export const game_list: Game[] = [
	{
		id: "nat",
		pokedexes: ["national"],
		generation: 9,
		name: "National Pokédex",
		versions: []
	},
	{
		id: "rby",
		pokedexes: ["kanto"],
		generation: 1,
		name: "Red, Blue, and Yellow",
		versions: [
			{
				name: "Red",
				blacklist: [
					27, 28, 37, 38, 52, 53, 69, 70, 71, 126, 127
				]
			},
			{
				name: "Blue",
				blacklist: [
					23, 24, 43, 44, 45, 56, 57, 58, 59, 123, 125
				]
			},
			{
				name: "Yellow",
				blacklist: [
					13, 14, 15, 23, 24, 26, 52, 53, 109, 110, 124, 125, 126
				]
			}
		]
	},
	{
		id: "gsc",
		pokedexes: ["original-johto"],
		generation: 2,
		name: "Gold, Silver, and Crystal",
		versions: [
			{
				name: "Gold",
				blacklist: [
					37, 38, 52, 53, 165, 166, 225, 227, 231, 232
				]
			},
			{
				name: "Silver",
				blacklist: [
					56, 57, 58, 59, 167, 168, 207, 216, 217, 226
				]
			},
			{
				name: "Crystal",
				blacklist: [
					37, 38, 56, 57, 179, 180, 181, 203, 223, 224
				]
			}
		]
	},
	{
		id: "rse",
		pokedexes: ["hoenn"],
		generation: 3,
		name: "Ruby, Sapphire, and Emerald",
		versions: []
	},
	{
		id: "frlg",
		pokedexes: ["kanto"],
		generation: 3,
		name: "Fire Red and Leaf Green",
		versions: []
	},
	{
		id: "dppt",
		pokedexes: ["extended-sinnoh"],
		generation: 4,
		name: "Diamond, Pearl, and Platinum",
		versions: []
	},
	{
		id: "hgss",
		pokedexes: ["updated-johto"],
		generation: 4,
		name: "HeartGold and SoulSilver",
		versions: []
	},
	{
		id: "bw",
		pokedexes: ["original-unova"],
		generation: 5,
		name: "Black and White",
		versions: []
	},
	{
		id: "b2w2",
		pokedexes: ["updated-unova"],
		generation: 5,
		name: "Black 2 and White 2",
		versions: []
	},
	{
		id: "xy",
		pokedexes: ["kalos-central", "kalos-coastal", "kalos-mountain"],
		generation: 6,
		name: "X and Y",
		versions: []
	},
	{
		id: "oras",
		pokedexes: ["updated-hoenn"],
		generation: 6,
		name: "Omega Ruby and Alpha Sapphire",
		versions: []
	},
	{
		id: "sm",
		pokedexes: ["original-alola"],
		generation: 7,
		name: "Sun and Moon",
		versions: []
	},
	{
		id: "usum",
		pokedexes: ["updated-alola"],
		generation: 7,
		name: "Ultra Sun and Ultra Moon",
		versions: []
	},
	{
		id: "lg",
		pokedexes: ["letsgo-kanto"],
		generation: 7,
		name: "Let's Go Pikachu and Let's Go Eevee",
		versions: []
	},
	{
		id: "ss",
		pokedexes: ["galar", "isle-of-armor", "crown-tundra"],
		generation: 8,
		name: "Sword and Shield",
		versions: []
	},
	{
		id: "ls",
		pokedexes: ["hisui"],
		generation: 8,
		name: "Legends Arceus",
		versions: []
	},
	{
		id: "bdsp",
		pokedexes: ["original-sinnoh"],
		generation: 8,
		name: "Brilliant Diamond and Shining Pearl",
		versions: []
	},
	{
		id: "sv",
		pokedexes: ["paldea", "kitakami", "blueberry"],
		generation: 9,
		name: "Scarlet and Violet",
		versions: []
	},
];

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
	for (let i = 0; i < selected_form.types.length; ++i)
	{
		if (selected_form.types[i].generation >= generation)
		{
			current_type = selected_form.types[i];
			break;
		}
	}

	return {
		id: id,
		name: selected_form.name,
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
	if (selected_form.past_abilities)
	{
		for (const legacy_ability of selected_form.past_abilities)
		{
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
	if (type < TypeData.length)
	{
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
	for (const damage_set of TypeData[offensive_type].damage)
	{
		if (damage_set.generation >= generation)
		{
			damage_multipliers = damage_set.multiplier;
			break;
		}
	}

	let final_multiplier = 1;
	for (const type of defensive_types)
	{
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
	if (number >= 0 && number <= 10)
		return roman_numerals[number];

	return "?";
}