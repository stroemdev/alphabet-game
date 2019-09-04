import React from "react";
import styled, {createGlobalStyle} from "styled-components";
import { VictoryChart, VictoryAxis, VictoryLine } from "victory";
import { RouteComponentProps } from "react-router";

const Styles = createGlobalStyle`
    @import url('https://fonts.googleapis.com/css?family=Permanent+Marker&display=swap');
    body {
        margin: 0px;
        height: 100%;
        background: #000000;  /* fallback for old browsers */
        background: -webkit-linear-gradient(to right, #434343, #000000);  /* Chrome 10-25, Safari 5.1-6 */
        background: linear-gradient(to right, #434343, #000000); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
    }

    div, span, p, button, input {
        font-family: 'Permanent Marker', cursive;
    }
`

const Container = styled.div`
    flex-grow: 1;
    flex-direction: column;
    height: 100vh;
    display: flex;
    margin: 0px;
    padding: 0px;
    justify-content: center;
    align-items: center;
`

const Letter = styled.span`
    text-transform: uppercase;
    color: #fff;
    font-size: 8rem;
    font-family: 'Permanent Marker', cursive;
`

const Debug = styled.div`
    position: fixed;
    top: 8px;
    left: 8px;
    margin: 0px;
    padding: 0px;
    border-style: solid;
    border-width: 1px;
    border-color: #000;
    background-color: #f00;
`

class Game {
    public letters:string[] = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'å', 'ä', 'ö' ];
    public times:number[]  = [];
    public currentIndex: number = 0;
    public startTime?:number;
    public endTime?:number;
    public incorrectPress:number = 0;

    public get time():number {
        if(this.startTime === undefined || this.endTime === undefined)
            return -1;

        return this.endTime - this.startTime;
    }

    public get currentLetter() {
        return this.letters[this.currentIndex];
    }

    public get done():boolean {
        return this.currentIndex >= this.letters.length;
    }

    public onKeyPress(e:any):Game {
        if(e.key === this.letters[this.currentIndex]) {
            return Object.assign(new Game, this, { 
                startTime: this.currentIndex === 0 ? Date.now() : this.startTime,
                currentIndex: this.currentIndex + 1,
                endTime: this.currentIndex + 1 >= this.letters.length ? Date.now() : this.endTime,
                times: [...this.times, Date.now()] 
            } as Partial<Game>)
        } else {
            return Object.assign(new Game, this, { incorrectPress: this.incorrectPress + 1 } as Partial<Game> )
        }
    }
 
}

interface IAlphabetGameProps {
    debug?:boolean
}

interface IAlphabetGameState {
    game: Game;
}

const highscoreKey  = "alphabet_highscore";

export class AlphabetGame extends React.Component<IAlphabetGameProps, IAlphabetGameState> {

    constructor(props:any) {
        super(props);

        this.onKeyDown = this.onKeyDown.bind(this);
        this.onRestart = this.onRestart.bind(this);

        this.state = {
            game: new Game
        }
    }   


    componentDidMount() {
        document.addEventListener('keypress', this.onKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keypress', this.onKeyDown)
    }


    onKeyDown(e:any) {

        if(this.state.game) {
            this.setState({game: this.state.game.onKeyPress(e)});
        }
    }

    onRestart() {
        this.setState({game: new Game});
    }

    render() {
        return (
            <Container>
                <Styles />
                {
                    this.props.debug === true && (
                        <Debug>
                            Start: {this.state.game.startTime} <br />
                            End: {this.state.game.endTime} <br />
                            Done: {this.state.game.done ? "DONE" : "NOT DONE"} <br />
                            Time: {this.state.game.time} <br />
                        </Debug>
                    )
                }
                
                {
                    this.state.game.done ? 
                        <GameStats 
                            game={this.state.game}
                            onRestart={this.onRestart}
                        /> :
                        <Letter>{this.state.game.currentLetter}</Letter>
                }
                
            </Container>
        );
    }
}

interface IGameStatProps {
    game: Game;
    onRestart: () => any;
}


const StatContainer = styled.div`
    width: 500px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const StatTitle = styled.div`
   text-transform: uppercase;
    color: #fff;
    font-size: 3.5rem;
    font-family: 'Permanent Marker', cursive;
`

const DoneButton = styled.button`
    background: transparent;
    border-style: solid;
    border-radius: 5px;
    border-color: #afafaf;
    border-width: 2px;
    color: #afafaf;
    font-size: 2rem;
    cursor: pointer;
    padding: 8px;


    transition: color 150ms cubic-bezier(0.215, 0.610, 0.355, 1);
    &:hover {
        color: #ffF;
        border-color: #fff;
    }

    &.input-button {
        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;
        background: transparent;
        color: #afafaf;

        &:hover {
            color: #fff;
        }

        &:focus {
            outline: none;
        }
    }
`


interface IGameStatState {
    name: string;
}

class GameStats extends React.Component<IGameStatProps, IGameStatState> {


    constructor(props:any) {
        super(props);
        this.state = {
            name: ""
        }
    }

    render() {
        const data = this.props.game.letters.map((v,i) => ({ x: v, y: this.props.game.times[i] }))
        const seconds = (this.props.game.time / 1000).toFixed(2);
      
        return (
            <StatContainer>
                <StatTitle>{seconds} sekunder</StatTitle>
                <VictoryChart>
                    <VictoryLine 
                        style={{
                            labels: {stroke: '#afafaf'},
                            data: {
                            stroke: '#afafaf'
                        }}}
                        data={data}
                    />
                    <VictoryAxis 
                        style={{
                            axisLabel: { stroke: '#afafaf' },
                            axis: { stroke: 'none' },
                            tickLabels: { stroke: '#afafaf' }
                        }}
                    />
                </VictoryChart>
                <DoneButton
                    onClick={this.props.onRestart}
                >
                    Nytt spel!
                </DoneButton>
            </StatContainer>
        )
    }
}
