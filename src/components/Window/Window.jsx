import { TitleBar, Frame } from "@react95/core";

const Window = ({ children, title, icon }) => {
    return (
        <Frame boxShadow="out" marginBottom="10px">
            <TitleBar
                active
                icon={icon}
                title={title}
                width="100%"
            >
                <TitleBar.OptionsBox>
                    <TitleBar.Option>X</TitleBar.Option>
                </TitleBar.OptionsBox>
            </TitleBar> 
            <div style={{ minHeight: 200, padding: 10}}>
                {children}
            </div>
        </Frame>
    );

}

export default Window;