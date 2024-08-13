import {
    _decorator,
    CCFloat,
    CCInteger,
    Component,
    EffectAsset,
    ImageAsset,
    Material,
    MeshRenderer,
    Node,
    Vec3,
    Vec4,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Mass")
export class Mass extends Component {
    private mat: Material;
    private followPos: Vec3; //从动点位置
    private massVelocity: Vec3; //从动点速度
    @property(CCFloat)
    public stiffness = 60.0; //劲度系数
    @property(CCFloat)
    public damping = 2.0; //阻尼系数

    private max: number;
    private min: number; //模型在模型空间最高, 最低点的y值
    private bound: Vec3;
    // private _delayMoveTime = 0.5;
    // private _curTime = 0;
    private _moveDir: Vec3;
    private myPos: Vec4;
    private vec4FollowPos: Vec4;
    private _moveStep = 0.01;
    private _massVec: Vec3 = new Vec3();
    private _forceDir: Vec3 = new Vec3();
    private isLoadComplete: boolean;
    start() {
        this.massVelocity = new Vec3(0.0, 0.0, 0.0);

        this.followPos = this.node.worldPosition.clone(); //虚拟抽象一个从动点

        // this.assetMgr.getRes("MassObj", EffectAsset, "shader").then((data) => { this.initShader(data); })
        var bound =
            this.getComponent(MeshRenderer).model.modelBounds.halfExtents;
        this.bound = bound;
        //使用加载好的 effect 初始化材质

        var mt = new Material();
        mt.copy(this.getComponent(MeshRenderer).sharedMaterial);
        // mt.initialize({ effectAsset: data, technique: 0 });
        this.getComponent(MeshRenderer).sharedMaterials = [mt];
        this.mat = mt;

        var pass = this.mat.passes[0];
        pass.setUniform(pass.getHandle("_MeshH"), bound.y * 2); //模型总高度

        this.myPos = new Vec4(
            this.node.position.x,
            this.node.position.y,
            this.node.position.z,
            1.0
        );
        this.isLoadComplete = true;
    }
    initShader(data: EffectAsset) {
        var bound =
            this.getComponent(MeshRenderer).model.modelBounds.halfExtents;
        this.bound = bound;
        //使用加载好的 effect 初始化材质

        var mt = new Material();
        mt.copy(this.getComponent(MeshRenderer).sharedMaterial);
        mt.initialize({ effectAsset: data, technique: 0 });
        this.getComponent(MeshRenderer).sharedMaterials = [mt];
        this.mat = mt;

        var pass = this.mat.passes[0];
        pass.setUniform(pass.getHandle("_MeshH"), bound.y * 2); //模型总高度

        this.myPos = new Vec4(
            this.node.position.x,
            this.node.position.y,
            this.node.position.z,
            1.0
        );
        this.isLoadComplete = true;
    }
    update(deltaTime: number) {
        if (!this.isLoadComplete) {
            return;
        }

        //进行一些受力, 加速度, 速度, 路程, 运动 的数值计算
        var force = this.GetMainForce(); //弹力

        force.add(this.GetDampingForce()); //阻力
        this.massVelocity.add(force.multiplyScalar(deltaTime)); //将固定质量为1, 则force数值等于加速度数值

        Vec3.multiplyScalar(this._massVec, this.massVelocity, deltaTime);
        this.followPos.add(this._massVec); //从动点的移动
        //为shader传入数据
        this.SetMatData();
    }
    private GetMainForce(): Vec3 {
        //胡克定律
        Vec3.subtract(this._forceDir, this.node.worldPosition, this.followPos);
        return this._forceDir.multiplyScalar(this.stiffness);
    }
    private GetDampingForce(): Vec3 {
        Vec3.multiplyScalar(this._massVec, this.massVelocity, -this.damping);
        return this._massVec; //弹簧阻尼
    }
    private SetMatData(): void {
        var pass = this.mat.passes[0];

        this.myPos = this.vec32vec4(this.node.worldPosition, this.myPos);
        this.vec4FollowPos = this.vec32vec4(this.followPos, this.vec4FollowPos);
        pass.setUniform(pass.getHandle("_MainPos"), this.myPos); //主动点
        pass.setUniform(pass.getHandle("_FollowPos"), this.vec4FollowPos); //从动点

        pass.setUniform(
            pass.getHandle("_W_Bottom"),
            this.node.worldPosition.y - this.bound.y
        ); //模型最低点y值
    }
    private vec32vec4(vec3: Vec3, vec4: Vec4) {
        if (!vec4) {
            vec4 = new Vec4();
        }
        vec4.x = vec3.x;
        vec4.y = vec3.y;
        vec4.z = vec3.z;
        vec4.w = 1.0;
        return vec4;
    }
    // set enabled(val:boolean){
    //     if(val){
    //         this.
    //     }
    // }
}
