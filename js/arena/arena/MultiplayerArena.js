import Component from '../../Component';
import EventHandler from '../../EventHandler';

export default class MultiplayerArena extends Component{

    constructor(){
        super();

        this.blockLocations = [];
        this.initialSpawnLocations = [];
        this.gameSpawnLocations = [];
    }

    enable(){
        EventHandler.addListener(this, EventHandler.Event.ARENA_BLOCKLOCATION_UPDATE, this.onBlockLocationUpdate);
        EventHandler.addListener(this, EventHandler.Event.ARENA_GAMESPAWN_UPDATE, this.onGameSpawnUpdate);
        EventHandler.addListener(this, EventHandler.Event.ARENA_INITIALSPAWN_UPDATE, this.onInitialSpawnUpdate);
    }

    disable(){
        EventHandler.removeListener(this, EventHandler.Event.ARENA_BLOCKLOCATION_UPDATE, this.onBlockLocationUpdate);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_GAMESPAWN_UPDATE, this.onGameSpawnUpdate);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_INITIALSPAWN_UPDATE, this.onInitialSpawnUpdate);
    }

    onBlockLocationUpdate(blockLocations){
        this.blockLocations = blockLocations;
    }

    onGameSpawnUpdate(gameSpawnLocations){
        this.gameSpawnLocations = gameSpawnLocations;
    }
    
    onInitialSpawnUpdate(initialSpawnLocations){
        this.initialSpawnLocations = initialSpawnLocations;
    }

    
}