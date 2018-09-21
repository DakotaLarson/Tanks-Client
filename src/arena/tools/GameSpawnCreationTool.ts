import Component from '../../component/ChildComponent';
import EventHandler from '../../EventHandler';

export default class GameSpawnCreationTool extends Component{

    constructor(){
        super();
    }

    enable(){
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
    }

    disable(){
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);
    }

    onMouseUp(event: MouseEvent){
        if(event.button === 0){
            EventHandler.callEvent(EventHandler.Event.GAMESPAWN_CREATION_TOOL_PRIMARY);
        }else if(event.button === 2){
            EventHandler.callEvent(EventHandler.Event.GAMESPAWN_CREATION_TOOL_SECONDARY);
        }
    }
}