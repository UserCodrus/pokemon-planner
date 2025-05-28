import { createContext, Dispatch, ReactElement, ReactNode, SetStateAction, useContext, useState } from "react";

/**
 * A structure describing a button with that runs a callback function when clicked
 */
type ModalButton = {
	label: string,
	callback?: Function
}

/**
 * A structure describing a modal pop-up
 */
type ModalData = {
	message: string,
	buttons: ModalButton[]
}

/**
 * The context that provides access to modal settings
 */
export const ModalContext = createContext<Dispatch<SetStateAction<ModalData | null>>>(() => console.error("Modal provider not initalized"));

/**
 * A modal pop-up that gives the user a series of options with actions attached to them
 */
function ModalBox(props: {modalData: ModalData}): ReactElement
{
	const openModal = useContext(ModalContext);

	// Create divs for each line of message text
	const messages: ReactElement[] = props.modalData.message.split('\n').map((value, i) => {
		if (value.length > 0)
			return <div key={i}>{value}</div>
		else
			return <br key={i} />
	});

	// Create the buttons for the modal box
	const buttons: ReactElement[] = [];
	if (props.modalData.buttons.length > 0)
	{
		for (let i = 0; i < props.modalData.buttons.length; ++i)
		{
			buttons.push(<button className="p-2" key={i} onClick={() => {
				if (props.modalData.buttons[i].callback)
					// @ts-ignore because the linter can't understand this line for some reason? I checked for a null callback on the line above, silly linter.
					props.modalData.buttons[i].callback(); 
				openModal!(null);
			}}>{props.modalData.buttons[i].label}</button>);
		}
	}
	else
	{
		buttons.push(<button className="p-2" onClick={() => {
			openModal!(null);
		}}>Confirm</button>);
	}

	return (
		<div className="fixed flex bg-shade z-9 top-0 left-0 min-w-screen min-h-screen backdrop-blur-sm justify-center items-center">
			<div className="panel z-10 grow-0 text-center">
				{messages}
				<div className="flex flex-row justify-evenly">{buttons}</div>
			</div>
		</div>
	)
}

/**
 * A wrapper component that provides access to modal popups for child components
 */
export function ModalWrapper(props: {children: ReactNode}): ReactElement
{
	const [modal, setModal] = useState<ModalData | null>(null);
	
	return (
		<ModalContext.Provider value={setModal}>
			{modal && <ModalBox modalData={modal} />}
			{props.children}
		</ModalContext.Provider>
	);
}