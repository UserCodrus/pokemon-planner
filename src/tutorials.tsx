const left_click = "left click";
const right_click = "right click";

const Left_click = "Left click";
const Right_click = "Right click";

const tutorials = {
	filter: <div>
		These controls allow you to filter the selectable pokemon.<br />
		<br />
		The buttons on the left side can select which types are available.<br />
		<strong>{Left_click}</strong> a button to hide or show that type.<br />
		<strong>{Right_click}</strong> a button to show only that type.
	</div>,

	analysis: <div>
		This panel shows the combat analysis for the current party.<br />
		<br />
		The first row of icons below each type shows how many pokemon have same-type moves that are effective against that type.<br />
		<span className="text-advantage font-bold">Red icons</span> indicate that a party member has a same type move that is <strong>super effective</strong> against that type.<br />
		<span className="text-disadvantage font-bold">Blue icons</span> indicate that a party member's same type moves are <strong>not very effective</strong> against that type.<br />
		<br />
		The second row shows the party's defenses against that type.<br />
		<span className="text-advantage font-bold">Red icons</span> indicates that attacks of that type are <strong>not very effective</strong> against a party member.<br />
		<span className="text-disadvantage font-bold">Blue icons</span> indicates that attacks of that type are <strong>super effective</strong> against a party member.
	</div>,
}

export default tutorials;