import Link from "next/link";

const left_click = <><strong>Left Click</strong> or <strong>Tap</strong></>;
const right_click = <><strong>Right Click</strong> or <strong>Long Press</strong></>;

const effective = <strong>super effective</strong>;
const ineffective = <strong>not very effective</strong>;

const tutorials = {
	pokemon_filter: <div>
		These controls allow you to filter the selectable Pokémon.<br />
		<br />
		The type buttons can filter Pokémon by their type.<br />
		{left_click} a button to hide or show Pokémon of that type.<br />
		{right_click} a button to show only Pokémon of that type.<br />
		<br />
		The middle box can filter Pokémon by which game version they appear in.<br />
		The last box can be used to search Pokémon by name.
	</div>,

	team_filter: <div>
		These controls allow you to filter your saved teams.<br />
		<br />
		The numbered buttons can filter teams by generation.<br />
		{left_click} a button to hide or show teams from that generation.<br />
		{right_click} a button to show only teams from that generation.<br />
		<br />
		The middle box can change the order in which teams are displayed.<br />
		The last box can be used to search teams by their name.
	</div>,

	party_analysis: <div>
		This panel shows the combat analysis for the current party.<br />
		<br />
		The first row of icons below each type shows how many Pokémon have same-type moves that are effective against that type.<br />
		<span className="text-advantage font-bold">Red icons</span> indicate that a party member has a same type move that is {effective} against that type.<br />
		<span className="text-disadvantage font-bold">Blue icons</span> indicate that a party member's same type moves are {ineffective} against that type.<br />
		<br />
		The second row shows the party's defenses against that type.<br />
		<span className="text-advantage font-bold">Red icons</span> indicates that attacks of that type are {ineffective} against a party member.<br />
		<span className="text-disadvantage font-bold">Blue icons</span> indicates that attacks of that type are {effective} against a party member.<br />
		<br />
		<strong>Icons with an outline</strong> indicate that your party will be vulnerable to that type. Consider changing your team to remove these weaknesses.
	</div>,

	party_analysis_alt: <div>
		This panel shows the combat analysis for the current party.<br />
		<br />
		The first row of icons below each type shows how many Pokémon have same-type moves that are effective against that type.<br />
		<span className="text-advantage font-bold">Red icons</span> indicate that a party member has a same type move that is {effective} against that type.<br />
		<span className="text-disadvantage font-bold">Blue icons</span> indicate that a party member's same type moves are {ineffective} against that type.<br />
		<br />
		The second row shows the party's defenses against that type.<br />
		<span className="text-advantage font-bold">Red icons</span> indicates that attacks of that type are {ineffective} against a party member.<br />
		<span className="text-disadvantage font-bold">Blue icons</span> indicates that attacks of that type are {effective} against a party member.<br />
		<br />
		<strong>Icons with an outline</strong> indicate that the party is stronger than the other party against that type.
	</div>,

	party_display: <div>
		This area displays your current party.<br />
		<br />
		{left_click} a party member to switch the party member's ability. <span className="text-special font-bold">Blue text</span> indicates that the selected ability is a <Link href="https://bulbapedia.bulbagarden.net/wiki/Hidden_Ability" target="_blank" rel="noopener noreferrer">hidden ability</Link>.<br />
		{right_click} a party member to remove that party member from your party.<br />
		<br />
		{left_click} a Pokémon in one of the boxes below to add that Pokémon to your team or remove it if it has already been added.<br />
		{right_click} a Pokémon to view the Pokémon's name and type. {left_click} the popup afterwards to view the Pokémon on pokemondb.net.<br />
	</div>,
}

export default tutorials;