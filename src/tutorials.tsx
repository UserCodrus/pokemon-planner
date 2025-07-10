const left_click = "left click";
const right_click = "right click";

const Left_click = "Left click";
const Right_click = "Right click";

const tutorials = {
	filter: `These controls allow you to filter the selectable pokemon.
	The buttons on the left side can select which types are available.
	${Left_click} a button to hide or show that type. ${Right_click} a button to show only that type.`,

	analysis: `This panel shows the combat analysis for the current party.

	The first row of icons below each type shows how many pokemon have same-type moves that are effective against that type.
	Red icons indicate that a party member has a same type move that is super effective against that type.
	Blue icons indicate that a party member's same type moves are all ineffective against that type.

	The second row shows the party's defenses against that type.
	Red icons indicate a party member has a defensive advantage against that type.\nBlue icons indicate a party member is weak to that type.`,
}

export default tutorials;