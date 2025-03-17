// String representations of image folders
const image_ext = ".png";
const type_sprite_location = "/images/types/";
const type_icon_location = "/images/types/icons/";
const pokemon_art_location = "/images/pokemon/art/";
const pokemon_sprite_location = "/images/pokemon/sprite/";

// Data type for pokemon data
export type Pokemon = {
	id: number,
	name: string,
	type: string[]
}

/**
 * Get the URL for a pokemon's artwork image
 * @param id The id of the pokemon
 */
export function pokemonArtURL(id: number)
{
	return pokemon_art_location + id.toString() + image_ext;
}

/**
 * Get the URL for a pokemon's sprite image
 * @param id The id of the pokemon
 */
export function pokemonSpriteURL(id: number)
{
	return pokemon_sprite_location + id.toString() + image_ext;
}

/**
 * Get the URL for a type sprite
 * @param type The name of the type
 */
export function typeSpriteURL(type: string)
{
	return type_sprite_location + type + image_ext;
}

/**
 * Get the URL for a type icon
 * @param type The name of the type
 */
export function typeIconURL(type: string)
{
	return type_icon_location + type + image_ext;
}