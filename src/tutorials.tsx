const left_click = "left click";
const right_click = "right click";

const tutorials = {
	filter: "These controls allow you to filter the selectable pokemon.\nThe buttons on the left side can select which types are available.\n" + 
	left_click + " a button to hide or show that type. " + right_click + " a button to show only that type.",
	analysis: "This panel shows the combat analysis for the current party.\n\n" +
	"The first row of icons below each type shows how many pokemon have same-type moves that are effective against that type.\n" +
	"Red icons indicate that a party member has a same type move that is super effective against that type.\nBlue icons indicate that a party member's same type moves are all ineffective against that type.\n\n" +
	"The second row shows the party's defenses against that type.\n" +
	"Red icons indicate a party member has a defensive advantage against that type.\nBlue icons indicate a party member is weak to that type."
}

export default tutorials;