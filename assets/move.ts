import { _decorator, Component, EventTouch, Input, Node, tween, v3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("move")
export class move extends Component {
    onEnable() {
        //this.node.on(Input.EventType.TOUCH_MOVE, this.touchMove, this);
        const pos = this.node.getPosition();
        tween(this.node)
            .to(0.5, { position: v3(pos.x + 3, pos.y, pos.z) })
            .delay(2)
            .to(0.5, { position: v3(pos.x - 3, pos.y, pos.z) })
            .delay(2)
            .union()
            .repeatForever()
            .start();
    }

    touchMove(event: EventTouch) {
        const touch = event.touch;
        const p = touch["_point"];
        const point = touch.getDelta();
        console.log(point);
    }

    update(deltaTime: number) {}
}
