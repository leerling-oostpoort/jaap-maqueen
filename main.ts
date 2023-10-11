function set_motion (spd: number, rot: number) {
    speed = spd
    rotation = rot
}
function set_mode () {
    if (mode > 0) {
        if (distance < 7) {
            mode = 4
        } else if (distance < 12) {
            mode = 3
        }
        if (mode == 2) {
            if (line_state) {
                mode = 5
            }
        }
        if ((mode == 3 || mode == 4) && distance > 11) {
            mode = 2
        }
    }
}
input.onButtonPressed(Button.A, function () {
    start_sequence()
})
input.onButtonPressed(Button.B, function () {
    control.reset()
})
function blink_turn_signals () {
    signal_state = !(signal_state)
    if (rotation < 0) {
        if (signal_state) {
            maqueen.writeLED(maqueen.LED.LEDLeft, maqueen.LEDswitch.turnOn)
        } else {
            maqueen.writeLED(maqueen.LED.LEDLeft, maqueen.LEDswitch.turnOff)
        }
        maqueen.writeLED(maqueen.LED.LEDRight, maqueen.LEDswitch.turnOff)
    } else if (rotation > 0) {
        if (signal_state) {
            maqueen.writeLED(maqueen.LED.LEDRight, maqueen.LEDswitch.turnOn)
        } else {
            maqueen.writeLED(maqueen.LED.LEDRight, maqueen.LEDswitch.turnOff)
        }
        maqueen.writeLED(maqueen.LED.LEDLeft, maqueen.LEDswitch.turnOff)
    } else {
        maqueen.writeLED(maqueen.LED.LEDLeft, maqueen.LEDswitch.turnOff)
        maqueen.writeLED(maqueen.LED.LEDRight, maqueen.LEDswitch.turnOff)
    }
}
function set_motors () {
    if (speed != last_speed || rotation != last_rotation) {
        left_speed = speed + rotation
        right_speed = speed - rotation
        last_speed = speed
        last_rotation = rotation
        if (left_speed > 0) {
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, motor_hist + left_speed)
        } else if (left_speed == 0) {
            maqueen.motorStop(maqueen.Motors.M1)
        } else {
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, motor_hist - left_speed)
        }
        if (right_speed > 0) {
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, motor_hist + right_speed)
        } else if (right_speed == 0) {
            maqueen.motorStop(maqueen.Motors.M2)
        } else {
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CCW, motor_hist - right_speed)
        }
    }
}
function read_sensors () {
    distance = maqueen.Ultrasonic(PingUnit.Centimeters)
    left_line = 1 - maqueen.readPatrol(maqueen.Patrol.PatrolLeft)
    right_line = 1 - maqueen.readPatrol(maqueen.Patrol.PatrolRight)
    line_state = left_line + right_line * 2
}
function start_sequence () {
    mode = 1
    basic.showString("3")
    basic.pause(500)
    basic.showString("2")
    basic.pause(500)
    basic.showString("1")
    basic.pause(500)
    basic.showString("0")
    basic.pause(500)
    basic.clearScreen()
    mode = 2
}
function heart_beat () {
    step = control.millis() - last_millis
    last_millis += step
    counter += 1
    if (mode != 1 && counter % 10 == 0) {
        led.toggle(mode % 5, mode / 5)
    }
}
function handle_mode () {
    if (mode == 1) {
        set_motion(0, 0)
    } else if (mode == 2) {
        set_motion(15, 0)
    } else if (mode == 3) {
        set_motion(0, 0)
    } else if (mode == 4) {
        set_motion(-8, 0)
    } else if (mode == 5) {
        set_motion(0, 0)
    } else if (mode == 6) {
        set_motion(0, 0)
    } else {
    	
    }
}
let counter = 0
let last_millis = 0
let step = 0
let right_line = 0
let left_line = 0
let right_speed = 0
let left_speed = 0
let last_rotation = 0
let last_speed = 0
let signal_state = false
let line_state = 0
let distance = 0
let mode = 0
let rotation = 0
let speed = 0
let motor_hist = 0
motor_hist = 15
basic.forever(function () {
    read_sensors()
    heart_beat()
    set_mode()
    handle_mode()
    set_motors()
})
/**
 * Modes:
 * 
 * 0: reset
 * 
 * 1: startup
 * 
 * 2: look for line
 * 
 * 3: stop
 * 
 * 4: backup 
 * 
 * 5: line detected
 * 
 * 6: line detected on left
 * 
 * 7: line detected on right
 */
loops.everyInterval(200, function () {
    blink_turn_signals()
})
