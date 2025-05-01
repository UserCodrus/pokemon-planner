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
 * Information about a game pulled from API data
 */ 
export type Game = {
	id: string,
	pokedexes: string[],
	generation: number,
	games: string
}

/**
 * Data for a single team slot
 */
export type TeamSlot = {
	id: number,
	form?: number,
	ability: number
};

/**
 * Saved data for a pokemon team
 */
export type Team = {
	name: string,
	pokedex: string,
	pokemon: TeamSlot[]
};

/**
 * The master list of pokedexes and their generations used in each game
 */
export const game_list: Game[] = [
	{
		id: "nat",
		pokedexes: ["national"],
		generation: 9,
		games: "National Pokédex"
	},
	{
		id: "rby",
		pokedexes: ["kanto"],
		generation: 1,
		games: "Red, Blue, and Yellow"
	},
	{
		id: "gsc",
		pokedexes: ["original-johto"],
		generation: 2,
		games: "Gold, Silver, and Crystal"
	},
	{
		id: "rse",
		pokedexes: ["hoenn"],
		generation: 3,
		games: "Ruby, Sapphire, and Emerald"
	},
	{
		id: "frlg",
		pokedexes: ["kanto"],
		generation: 3,
		games: "Fire Red and Leaf Green"
	},
	{
		id: "dp",
		pokedexes: ["original-sinnoh"],
		generation: 4,
		games: "Diamond and Pearl"
	},
	{
		id: "pt",
		pokedexes: ["extended-sinnoh"],
		generation: 4,
		games: "Platinum"
	},
	{
		id: "hgss",
		pokedexes: ["updated-johto"],
		generation: 4,
		games: "HeartGold and SoulSilver"
	},
	{
		id: "bw",
		pokedexes: ["original-unova"],
		generation: 5,
		games: "Black and White"
	},
	{
		id: "b2w2",
		pokedexes: ["updated-unova"],
		generation: 5,
		games: "Black 2 and White 2"
	},
	{
		id: "xy",
		pokedexes: ["kalos-central", "kalos-coastal", "kalos-mountain"],
		generation: 6,
		games: "X and Y"
	},
	{
		id: "oras",
		pokedexes: ["updated-hoenn"],
		generation: 6,
		games: "Omega Ruby and Alpha Sapphire"
	},
	{
		id: "sm",
		pokedexes: ["original-alola"],
		generation: 7,
		games: "Sun and Moon"
	},
	{
		id: "usum",
		pokedexes: ["updated-alola"],
		generation: 7,
		games: "Ultra Sun and Ultra Moon"
	},
	{
		id: "lg",
		pokedexes: ["letsgo-kanto"],
		generation: 7,
		games: "Let's Go Pikachu and Let's Go Eevee"
	},
	{
		id: "ss",
		pokedexes: ["galar", "isle-of-armor", "crown-tundra"],
		generation: 8,
		games: "Sword and Shield"
	},
	{
		id: "ls",
		pokedexes: ["hisui"],
		generation: 8,
		games: "Legends Arceus"
	},
	{
		id: "bdsp",
		pokedexes: ["extended-sinnoh"],
		generation: 8,
		games: "Brilliant Diamond and Shining Pearl"
	},
	{
		id: "sv",
		pokedexes: ["paldea", "kitakami", "blueberry"],
		generation: 9,
		games: "Scarlet and Violet"
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