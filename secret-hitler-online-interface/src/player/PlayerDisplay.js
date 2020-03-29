import React, {Component} from 'react';
import Player from "./Player";
import {
    FASCIST,
    PARAM_PLAYERS,
    PLAYER_NAME,
    PLAYER_IDENTITY,
    PLAYER_IS_ALIVE,
    HITLER,
    LIBERAL,
    PARAM_CHANCELLOR,
    PARAM_PRESIDENT,
    PARAM_STATE,
    STATE_CHANCELLOR_NOMINATION,
    STATE_LEGISLATIVE_PRESIDENT,
    STATE_LEGISLATIVE_PRESIDENT_VETO,
    STATE_PP_PEEK,
    STATE_PP_ELECTION,
    STATE_PP_EXECUTION,
    STATE_PP_INVESTIGATE,
    STATE_POST_LEGISLATIVE, STATE_LEGISLATIVE_CHANCELLOR, STATE_CHANCELLOR_VOTING, PARAM_VOTES
} from "../GlobalDefinitions";
import './PlayerDisplay.css';

/**
 * Displays a row of player icons and handles displaying busy status, votes, and roles where applicable.
 */
class PlayerDisplay extends Component {

    // A map from the role to a boolean value determining if it should be shown.
    showRoleByRole = {FASCIST:false, HITLER:false, LIBERAL: false};

    constructor(props) {
        super(props);
        this.determineRolesToShow();
    }

    /**
     * Updates which roles should be shown based on the role of the user.
     * @effects: if the user is {@code LIBERAL}, no roles will be shown.
     *           If {@code FASCIST}, {@code FASCIST} and {@code HITLER} roles will be shown.
     *           If there are {@literal <=} 6 players, then {@code HITLER} is the same as {@code FASCIST}.
     *           Otherwise, if {@code HITLER}, only {@code HITLER} roles will be shown.
     */
    determineRolesToShow() {
        let i = 0;
        let role = FASCIST;
        let players = this.props.gameState[PARAM_PLAYERS];
        for (i; i < players.length; i++) {
            let playerData = players[i];
            if (playerData[PLAYER_NAME] === this.props.user) {
                role = playerData[PLAYER_IDENTITY];
                break;
            }
        }

        switch (role) {
            case FASCIST:
                this.showRoleByRole = {FASCIST: true, HITLER: true, LIBERAL: false};
                break;
            case HITLER:
                if (players.length <= 6) {
                    this.showRoleByRole = {FASCIST: true, HITLER: true, LIBERAL: false};
                } else {
                    this.showRoleByRole = {FASCIST: false, HITLER: true, LIBERAL: false};
                }
                break;
            case LIBERAL:
            default:
                this.showRoleByRole = {FASCIST: false, HITLER: false, LIBERAL: false};
                break;
        }
    }

    /**
     * Returns a set of players that should be considered 'busy' and marked on the interface. A player is considered
     * busy if the game is waiting for some input from them.
     */
    getBusyPlayerSet() {
        let game = this.props.gameState;
        let busyPlayers = new Set([]);
        console.log("Setting busy players...");
        switch (game[PARAM_STATE]) {
            case STATE_CHANCELLOR_NOMINATION:
            case STATE_LEGISLATIVE_PRESIDENT:
            case STATE_LEGISLATIVE_PRESIDENT_VETO:
            case STATE_PP_PEEK:
            case STATE_PP_ELECTION:
            case STATE_PP_EXECUTION:
            case STATE_PP_INVESTIGATE:
            case STATE_POST_LEGISLATIVE:
                busyPlayers.add(game[PARAM_PRESIDENT]);
                break;
            case STATE_LEGISLATIVE_CHANCELLOR:
                busyPlayers.add(game[PARAM_CHANCELLOR]);
                break;
            case STATE_CHANCELLOR_VOTING:

                game[PARAM_PLAYERS].forEach((p, index) => {
                    let name = p[PLAYER_NAME];
                    let isAlive = p[PLAYER_IS_ALIVE]
                    if (!game[PARAM_VOTES].hasOwnProperty(name) && isAlive) { // player has not voted (is not in the map of votes) and is alive
                        busyPlayers.add(name);
                    }
                });

                break;
            default: // This includes the victory states and setup.
                break;
        }
        console.log(busyPlayers);
        return busyPlayers;
    }

    /**
     * Gets the HTML tags for the players in the provided indices.
     * @param start {int} the starting index, inclusive.
     * @param end {int} the ending index, exclusive.
     * @return {html[]} an array of html tags representing the players in indices {@code start} (inclusive)
     *         to {@code end} (exclusive).
     */
    getPlayers(start, end) {
        let out = [];
        let players = this.props.gameState[PARAM_PLAYERS];
        let busyPlayers = this.getBusyPlayerSet();
        let i = 0;
        for (i; start + i < end; i++) {
            let index = i + start;
            let playerData = players[index];
            let playerName = playerData[PLAYER_NAME];

            let roleText = "";
            if (playerName === this.props.user) {
                roleText = "(YOU)";
            }
            if (playerName === this.props.gameState[PARAM_CHANCELLOR]) {
                roleText = "CHANCELLOR";
            } else if (playerName === this.props.gameState[PARAM_PRESIDENT]) {
                roleText = "PRESIDENT";
            }

            out[i] = (
                <div id={"player-display-text-container"}>
                    <p id="player-display-label">{roleText}</p>
                    <Player
                        isBusy ={busyPlayers.has(playerName)}
                        role = {playerData[PLAYER_IDENTITY]}
                        showRole = {this.showRoleByRole[playerData[PLAYER_IDENTITY]] || playerName === this.props.user}
                        isUser = {playerName === this.props.user}
                        disabled = {!playerData[PLAYER_IS_ALIVE]}
                        name = {playerName}
                    />
                </div>
            )
        }
        return out;
    }

    /* Note that there are two player-display-containers, so that the player tiles can be split into two rows if there
    * is insufficient space for them.*/
    render() {
        let players = this.props.gameState[PARAM_PLAYERS];
        let middleIndex = Math.floor(players.length / 2);
        this.determineRolesToShow();
        return (
            <div id="player-display">
                <div id="player-display-container">
                    {this.getPlayers(0, middleIndex)}
                </div>
                <div id="player-display-container">
                    {this.getPlayers(middleIndex, players.length)}
                </div>
            </div>
        );
    }
}

PlayerDisplay.defaultProps = {
    user: "qweq", /* The name of the user. */
    gameState: {"liberal-policies":0,"fascist-policies":0,"discard-size":0,"draw-size":17,"players":[{"alive":true,"identity":"LIBERAL","investigated":false,"username":"kjh"},{"alive":true,"identity":"LIBERAL","investigated":false,"username":"fff"},{"alive":true,"identity":"FASCIST","investigated":false,"username":"t"},{"alive":true,"identity":"HITLER","investigated":false,"username":"qweq"},{"alive":true,"identity":"LIBERAL","investigated":false,"username":"sdfs"}],"in-game":true,"state":"CHANCELLOR_NOMINATION","president":"kjh","election-tracker":0,"user-votes":{}}
};

export default PlayerDisplay;