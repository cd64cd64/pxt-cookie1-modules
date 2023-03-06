/**
 * Provides access to basic micro:bit functionality.
 */

enum ModuleIndex {
    //% block="module1"
    Module1,
    //% block="module2"
    Module2,
    //% block="module3"
    Module3,
    //% block="module4"
    Module4
}

enum TouchIndex {
    //% block="1"
    T1,
    //% block="2"
    T2,
}

enum KeyIndex {
    //% block="1"
    T1,
    //% block="2"
    T2,
    //% block="3"
    T3,
    //% block="4"
    T4
}

enum PressIndex {
    //% block="1"
    T1,
    //% block="2"
    T2
}

enum SubIndex { 
    //% block="1"
    subModule1 = 1,
    //% block="2"
    subModule2,
    //% block="3"
    subModule3,
    //% block="4"
    subModule4
}

enum MesureContent {
    //% block="onboard temp"
    TempOnBoard,
    //% block="onboard humidity"
    HmOnBoard,
}

enum LedIndex {
    //% block="all"
    All,
    //% block="1"
    L1,
    //% block="2"
    L2,
    //% block="3"
    L3,
    //% block="4"
    L4, 
}




//% color=190 weight=100 icon="\uf1ec" block="wangbit Modules"
namespace wangbitModules {
    const SONAR_ADDRESS = 0x52
    const MOTOR_ADDRESS = 0x64
    const SERVO_ADDRESS = 0x74
    const LED_ADDRESS = 0x53
    const SEG_ADDRESS = 0x6C
    const TOUCHKEY_ADDRESS = 0x70
    const RGB_TOUCHKEY_ADDRESS = 0x4C
    const TEMP_ADDRESS = 0x5c
    const IOT_ADDRESS = 0x50
    const PH_ADDRESS = 0x60
    const TB_ADDRESS = 0x61
    const SPEECH_ADDRESS = 0x69
    const SOIL_ADDRESS = 0x48
    const LINE_ADDRESS = 0x51
    const COLOR_ADDRESS = 0x40
    const RGB_ADDRESS = 0x3C
    const PRESS_ADDRESS = 0x34
    const HOARE_ADDRESS = 0x44
    const INF_ADDRESS = 0x28
    const LOUDNESS_ADDRESS = 0x38
    const LED_DISPLAY_TEMP_ADDRESS = 0x2C
    const KEY_ADDRESS = 0x30
    const lowBright = 8
    const selectColors = [0xff0000, 0xffa500, 0xffff00, 0x00ff00, 0x00ffff, 0x0000ff, 0x800080, 0xffffff, 0x000000]
    let tempDevEnable = [false, false, false, false]
    let neopixelBuf = pins.createBuffer(14);
    let neopixeBuf = pins.createBuffer(26);
    function sonicEnable() {
        pins.i2cWriteRegister(SONAR_ADDRESS, 0x00, 0x01);
    }

    // 将字符串格式化为UTF8编码的字节
    let writeUTF = function (str:String, isGetBytes?:boolean) {
        let back = [];
        let byteSize = 0;
        let i = 0;
        for (let i = 0; i < str.length; i++) {
            let code = str.charCodeAt(i);
            if (0x00 <= code && code <= 0x7f) {
                byteSize += 1;
                back.push(code);
            } else if (0x80 <= code && code <= 0x7ff) {
                byteSize += 2;
                back.push((192 | (31 & (code >> 6))));
                back.push((128 | (63 & code)))
            } else if ((0x800 <= code && code <= 0xd7ff) 
                    || (0xe000 <= code && code <= 0xffff)) {
                byteSize += 3;
                back.push((224 | (15 & (code >> 12))));
                back.push((128 | (63 & (code >> 6))));
                back.push((128 | (63 & code)))
            }
        }
        for (i = 0; i < back.length; i++) {
            back[i] &= 0xff;
        }
        return back;
        
    }

    function constract(val: number, minVal: number, maxVal: number): number {
        if (val > maxVal) {
            return maxVal;
        } else if (val < minVal) {
            return minVal;
        }
        return val;
    }

    function tempEnable(address: number, index: number) { 
        pins.i2cWriteRegister(address, 0x00, 0x01);
        tempDevEnable[index] = true;
    }

    function validate(str: String): Boolean { 
        let isfloat = false;
        let len = str.length;
        if (len > 5) { 
            return false;
        }
        for (let i = 0; i < len; i++) { 
            if (str.charAt(i) == ".") { 
                isfloat = true;
                return true;
            }
        }
        if (!isfloat && len == 5) { 
            return false;
        }
        return true;
    }

    /**
     * TODO: 获取超声波传感器与前方障碍物的距离函数。
     */
    //% block weight=50
    export function readDistance(): number {
        sonicEnable();
        let sonarVal = pins.i2cReadRegister(SONAR_ADDRESS, 0x01, NumberFormat.Int16LE);
        let distance = sonarVal / 58;
        return distance;
    }

    /**
     * TODO: 控制马达PWM输出。
     */
    //% block="control motor %module  output %speed"
    //% speed.min=-255 speed.max=255
    //% weight=65
    export function controlMotorOutput(module: ModuleIndex, speed: number) {
        let buf = pins.createBuffer(8);
        buf[0] = 0x00;
        buf[1] = speed > 0 ? 0 : 1;
        buf[2] = Math.abs(speed)
        pins.i2cWriteBuffer(MOTOR_ADDRESS + module, buf);
    }

    /**
     * TODO: 显示数码管数值。
     */
    //% blockId=display_seg_number block="control seg %module display number %num"
    //% weight=65
    export function displaySegNumber(module: ModuleIndex, num: number) {
        let buf = pins.createBuffer(6);
        buf[0] = 0;
        buf[1] = 1;
        buf[2] = 0;
        buf[3] = 0;
        buf[4] = 0;
        buf[5] = 0;
        let str_num = num.toString();
        let len = str_num.length;
        let j = 0;
        if (validate(str_num)) { 
            for (let i = len - 1; i >= 0; i--) { 
                if (str_num.charAt(i) == '.') {
                    buf[5 - j] = (str_num.charCodeAt(i - 1) - '0'.charCodeAt(0)) | 0x80;
                    i--;
                } else if (str_num.charAt(i) == "-") {
                    buf[5 - j] = 0x40;
                } else { 
                    buf[5 - j] = str_num.charCodeAt(i) - '0'.charCodeAt(0);
                }
                j++;
            }
            pins.i2cWriteBuffer(SEG_ADDRESS, buf);
        }
    }
    

    /**
     * TODO: 读取PH。
     */
    //% blockId=read_ph block="read %module pm data"
    //% weight=65

    export function readPHData(module: ModuleIndex): number{
        pins.i2cWriteRegister(PH_ADDRESS + module, 0x00, 0x01);
        let data = pins.i2cReadRegister(PH_ADDRESS  + module , 0x01, NumberFormat.UInt8LE);
        return (data);
    }
    /**
     * TODO: 读取TB。
     */
    //% blockId=read_tb block="read %module tb data"
    //% weight=65

    export function readTBData(module: ModuleIndex): number{
        pins.i2cWriteRegister(TB_ADDRESS + module, 0x00, 0x01);
        let data = pins.i2cReadRegister(TB_ADDRESS  + module , 0x01, NumberFormat.UInt8LE);
        return (data);
    }

    /**
     * TODO: 读取压力值。
     */
    //% blockId=read_press block="read %module press data"
    //% weight=65
    export function readPressData(module: ModuleIndex): number{ 
        pins.i2cWriteRegister(PRESS_ADDRESS + module, 0x00, 0x01);
        let data = pins.i2cReadRegister(PRESS_ADDRESS  + module , 0x01, NumberFormat.UInt8LE);
        return (data);
    }

}
