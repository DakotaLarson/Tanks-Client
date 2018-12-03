import { Plane, Ray, Vector3, Vector4 } from "three";
import Component from "../../component/ChildComponent";
import DomHandler from "../../DomHandler";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";
import Options from "../../Options";
import PacketSender from "../../PacketSender";
import RaycastHandler from "../../RaycastHandler";
import BlockCollisionHandler from "../BlockCollisionHandler";

const PLAYER_MOVEMENT_SPEED = 5;
const PLAYER_ROTATION_SPEED = 2.5;

export default class Player extends Component {

    public static radius = Math.sqrt(Math.pow(0.5, 2) + Math.pow(0.75, 2));

    public position: Vector3;

    public id: number;

    public color: number;

    public bodyRotation: number;
    public headRotation: number;

    private movementVelocity: number;
    private rotationVelocity: number;

    private movingForward: boolean;
    private movingBackward: boolean;
    private rotatingLeft: boolean;
    private rotatingRight: boolean;

    private movingLastFrame: boolean;

    constructor(id: number, color: number, pos: Vector4) {
        super();
        this.id = id;

        this.position = new Vector3(pos.x, pos.y, pos.z);
        this.bodyRotation = pos.w;
        this.headRotation = pos.w;

        this.color = color;

        this.movingForward = false;
        this.movingBackward = false;

        this.rotatingLeft = false;
        this.rotatingRight = false;

        this.movingLastFrame = false;

        this.movementVelocity = 0;
        this.rotationVelocity = 0;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);

        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);

        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onOverlayOpen);
        EventHandler.addListener(this, EventHandler.Event.CHAT_OPEN, this.onOverlayOpen);

        if (!this.cameraIsFollowing()) {
            EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEMOVE, this.onMouseMove);
        }

        EventHandler.addListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);

        EventHandler.addListener(this, EventHandler.Event.GAME_TICK, this.onTick);

        EventHandler.addListener(this, EventHandler.Event.CAMERA_TOGGLE, this.onCameraToggle);

        EventHandler.addListener(this, EventHandler.Event.DOM_BLUR, this.onBlur);

        this.movementVelocity = 0;
        this.rotationVelocity = 0;

        this.movingForward = false;
        this.movingBackward = false;

        this.rotatingLeft = false;
        this.rotatingRight = false;

        this.movingLastFrame = false;

        PacketSender.sendPlayerMove(this.position, this.movementVelocity, this.rotationVelocity, this.bodyRotation, this.headRotation);
        if (!this.cameraIsFollowing() && !DomHandler.hasPointerLock()) {
            DomHandler.requestPointerLock();
        }
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);

        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEDOWN, this.onMouseDown);
        EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEUP, this.onMouseUp);

        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onOverlayOpen);
        EventHandler.removeListener(this, EventHandler.Event.CHAT_OPEN, this.onOverlayOpen);

        if (!this.cameraIsFollowing()) {
            EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEMOVE, this.onMouseMove);
        }

        EventHandler.removeListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);

        EventHandler.removeListener(this, EventHandler.Event.GAME_TICK, this.onTick);

        EventHandler.removeListener(this, EventHandler.Event.CAMERA_TOGGLE, this.onCameraToggle);

        EventHandler.removeListener(this, EventHandler.Event.DOM_BLUR, this.onBlur);

        PacketSender.sendReloadMoveToggle(false);
        this.movingLastFrame = false;
        DomHandler.exitPointerLock();
    }

    private onKeyDown(event: KeyboardEvent) {
        this.onInputDown(event.code);
    }

    private onKeyUp(event: KeyboardEvent) {
       this.onInputUp(event.code);
    }

    private onMouseDown(event: MouseEvent) {
        this.onInputDown(event.button);
    }

    private onMouseUp(event: MouseEvent) {
        this.onInputUp(event.button);
    }

    private onMouseMove(event: MouseEvent) {
        if (!this.isOverlayOpen()) {
            this.headRotation -= event.movementX / 365;
        }
    }

    private onInputDown(code: string | number) {
        if (!this.cameraIsFollowing() && !DomHandler.hasPointerLock() && !this.isOverlayOpen()) {
            DomHandler.requestPointerLock();
        }

        if (code === Options.options.forward.code) {
            this.movingForward = true;
        } else if (code === Options.options.backward.code) {
            this.movingBackward = true;
        } else if (code === Options.options.left.code) {
            this.rotatingLeft = true;
        } else if (code === Options.options.right.code) {
            this.rotatingRight = true;
        } else if (code === Options.options.shoot.code && !this.isOverlayOpen()) {
            PacketSender.sendPlayerShoot();
        } else if (code === Options.options.reload.code && !this.isOverlayOpen()) {
            PacketSender.sendReloadRequest();
        }
    }

    private onInputUp(code: string | number) {
        if (code === Options.options.forward.code) {
            this.movingForward = false;
        } else if (code === Options.options.backward.code) {
            this.movingBackward = false;
        } else if (code === Options.options.left.code) {
            this.rotatingLeft = false;
        } else if (code === Options.options.right.code) {
            this.rotatingRight = false;
        }
    }

    private onUpdate(delta: number) {

        const multiplier = 10;

        // Velocity always goes to 0 with this calculation.
        this.movementVelocity -= this.movementVelocity * 10 * delta;
        this.rotationVelocity -= this.rotationVelocity * 10 * delta;

        if (this.movingForward && !this.movingBackward && !this.isOverlayOpen()) {
            this.movementVelocity += PLAYER_MOVEMENT_SPEED * delta * multiplier;
        } else if (this.movingBackward && !this.movingForward && !this.isOverlayOpen()) {
            this.movementVelocity -= PLAYER_MOVEMENT_SPEED * delta * multiplier;
        }

        if (this.rotatingLeft && !this.rotatingRight && !this.isOverlayOpen()) {
            this.rotationVelocity += PLAYER_ROTATION_SPEED * delta * multiplier;
        } else if (this.rotatingRight && !this.rotatingLeft && !this.isOverlayOpen()) {
            this.rotationVelocity -=  PLAYER_ROTATION_SPEED * delta * multiplier;
        }

        const moving = this.movingForward && this.movingBackward && this.rotatingLeft && this.rotatingRight;

        if (!moving && Math.abs(this.movementVelocity) < 0.005) {
            this.movementVelocity = 0;
        }

        if (!moving && Math.abs(this.rotationVelocity) < 0.005) {
            this.rotationVelocity = 0;
        }

        const rotationDiff = delta * this.rotationVelocity;
        const potentialRotation = (this.bodyRotation + rotationDiff);

        const potentialPosition = this.position.clone();
        potentialPosition.x += delta * this.movementVelocity * Math.sin(potentialRotation),
        potentialPosition.z += delta * this.movementVelocity * Math.cos(potentialRotation);

        const collisionCorrection = BlockCollisionHandler.getCollision(potentialPosition.clone(), potentialRotation);

        if (this.cameraIsFollowing() && !this.isOverlayOpen()) {
            this.computeTurretRotation();
        }

        if (collisionCorrection) {
            potentialPosition.sub(collisionCorrection);
            this.bodyRotation = potentialRotation;
            this.headRotation += rotationDiff;
            this.position.copy(potentialPosition);
        } else {
            this.bodyRotation = potentialRotation;
            this.position.copy(potentialPosition);
        }

        const movementData = {
            id: this.id,
            pos: this.position,
            bodyRot: this.bodyRotation,
            headRot: this.headRotation,
            fromServer: false,
        };

        const movingThisFrame = this.movingForward || this.movingBackward;

        if (movingThisFrame !== this.movingLastFrame) {
            PacketSender.sendReloadMoveToggle(movingThisFrame);
            this.movingLastFrame = movingThisFrame;
        }

        EventHandler.callEvent(EventHandler.Event.PLAYER_MOVE, movementData);
    }

    private onTick() {
        PacketSender.sendPlayerMove(this.position, this.movementVelocity, this.rotationVelocity, this.bodyRotation, this.headRotation);
    }

    private computeTurretRotation() {
        const ray: Ray = RaycastHandler.getRaycaster().ray;
        const intersection = new Vector3();
        const playerPosition = this.position.clone().add(new Vector3(0.5, 0, 0.5));
        ray.intersectPlane(new Plane(new Vector3(0, 1, 0), -0.75), intersection);
        const slope = (playerPosition.x - intersection.x) / (playerPosition.z - intersection.z);
        let angle = Math.atan(slope);

        if (playerPosition.z > intersection.z) {
            angle += Math.PI;
        }
        this.headRotation = angle;
    }

    private onCameraToggle() {
        if (!this.isOverlayOpen()) {
            if (this.cameraIsFollowing()) {
                EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEMOVE, this.onMouseMove);
                DomHandler.exitPointerLock();
            } else {
                EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEMOVE, this.onMouseMove);
                // dupe pointer lock request opens game menu; Request is sent in MultiplayerCamera class.
            }
        }
    }

    private cameraIsFollowing() {
        return Globals.getGlobal(Globals.Global.CAMERA_IS_FOLLOWING);
    }

    private onBlur() {
        this.movementVelocity = 0;
        this.rotationVelocity = 0;
        this.onTick(); // Prevents jitter in other clients.
    }

    private onOverlayOpen() {
        this.movingForward = false;
        this.movingBackward = false;

        this.rotatingLeft = false;
        this.rotatingRight = false;
    }

    private isOverlayOpen() {
        return Globals.getGlobal(Globals.Global.CHAT_OPEN) || Globals.getGlobal(Globals.Global.GAME_MENU_OPEN);
    }
}
