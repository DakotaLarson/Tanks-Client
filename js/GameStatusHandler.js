import EventHandler from './EventHandler';
import Component from './Component';

export default class GameStatusHandler extends Component{

    constructor(){
        super();
    }

    enable = () => {
        EventHandler.addListener(EventHandler.Event.PKT_RECV_GAME_STATUS, this.onGameStatusUpdate);
    };

    disable = () => {
        EventHandler.removeListener(EventHandler.Event.PKT_RECV_GAME_STATUS, this.onGameStatusUpdate);

    };

    onGameStatusUpdate = (status) => {
        switch(status){
            case GameStatus.WAITING:
                console.log('Waiting GameStatus');
                EventHandler.callEvent(EventHandler.Event.GAME_STATUS_WAITING);
                break;
            case GameStatus.PREPARING:
                console.log('Preparing GameStatus');
                EventHandler.callEvent(EventHandler.Event.GAME_STATUS_PREPARING);
                break;
            case GameStatus.RUNNING:
                console.log('Running GameStatus');
                EventHandler.callEvent(EventHandler.Event.GAME_STATUS_RUNNING);
                break;
            case GameStatus.FINISHING:
                console.log('Finishing GameStatus');
                EventHandler.callEvent(EventHandler.Event.GAME_STATUS_FINISHING);
                break;
        }
    };
}

const GameStatus = {
    WAITING: 0,
    PREPARING: 1,
    RUNNING: 2,
    FINISHING: 3
};