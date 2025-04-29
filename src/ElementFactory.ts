import * as joint from '@joint/core';
import { SpeedTrackingElement } from './SpeedTrackingElement';
import { BarMagnetElement } from './magnet/BarMagnetElement';
import { UMagnetElement } from './magnet/UMagnetElement';
import { Earth } from './magnet/Earth';
import { HangingMagnetElement, PivotPointElement } from './magnet/hanging-magnet-element';
import { Compass } from './magnet/compass';
import { Coil, LED, LEDReverse, PowerSupply } from './electric/LinkableElement';


export class ElementFactory {
    public static readonly barMagnetElementList: BarMagnetElement[] = [];
    public static readonly uMagnetElementList: UMagnetElement[] = [];
    public static readonly EarthList: Earth[] = [];
    public static readonly hangingMagnetElementList: HangingMagnetElement[] = [];
    public static readonly compassList: Compass[] = [];
    public static readonly coilList: Coil[] = [];
    public static readonly LEDList: LED[] = [];
    public static readonly LEDReverseList: LEDReverse[] = [];
    public static readonly pivotList: PivotPointElement[] = [];
    static create(type: string, x: number, y: number): joint.dia.Element {
        let element: joint.dia.Element;

        switch (type) {
            case 'rectangle':
                element = new SpeedTrackingElement();
                break;
            case 'Nam châm':
                element = new BarMagnetElement();
                this.barMagnetElementList.push(element as BarMagnetElement);
                break;
            case 'Nam châm chữ U':
                element = new UMagnetElement();
                this.uMagnetElementList.push(element as UMagnetElement);
                break;
            case 'Trái Đất':
                element = new Earth();
                this.EarthList.push(element as Earth);
                break
            case 'Nam châm có sẵn móc treo':
                element = new HangingMagnetElement();
                this.hangingMagnetElementList.push(element as HangingMagnetElement);
                break;
            case 'La bàn':
                element = new Compass();
                this.compassList.push(element as Compass);
                break;
            case 'Cuộn Dây':
                // element = new NodeElement({
                //     position: { x: 100, y: 100 },
                //     size: { width: 100, height: 100 },
                //     ports: {
                //         items: [
                //             {
                //                 group: 'right',
                //                 id: 'port1',
                //             },
                //             {
                //                 group: 'left',
                //                 id: 'port2',
                //                 // TODO: we need to redefine the port on element resize
                //                 // The port is currently defined proportionally to the element size.
                //                 // args: {
                //                 //     dy: 30
                //                 // }
                //             },
                //         ],
                //     },
                // });

                element = new Coil();
                this.coilList.push(element as Coil);
                break;

            case 'Nguồn điện':
                // element = new NodeElement({
                //     position: { x: 100, y: 100 },
                //     size: { width: 300, height: 100 },
                //     ports: {
                //         items: [
                //             {
                //                 group: 'top',
                //                 id: 'port1',
                //             },
                //             {
                //                 group: 'top',
                //                 id: 'port2',
                //                 // TODO: we need to redefine the port on element resize
                //                 // The port is currently defined proportionally to the element size.
                //                 // args: {
                //                 //     dy: 30
                //                 // }
                //             },
                //         ],
                //     },
                // });
                element = new PowerSupply();
                break;
            case 'LED':
                element = new LED();
                this.LEDList.push(element as LED);
                break;
            case 'LED ngược chiều':
                element = new LEDReverse();
                this.LEDReverseList.push(element as LEDReverse);
                break;
            case 'Điểm treo':
                element = new PivotPointElement();
                this.pivotList.push(element as PivotPointElement);
                break;
            default:
                throw new Error(`Unknown element type: ${type}`);
        }

        element.position(x, y);
        return element;
    }
}
