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
 * 
 * 8: left line follow
 * 
 * 9: right line follow
 * 
 * 10: calibrate compass 1
 * 
 * 11: calibrate compass 2
 */
function calibrate () {
    input.calibrateCompass()
    basic.showIcon(IconNames.Pitchfork)
    basic.pause(5000)
    start_heading = input.compassHeading()
    mode = 10
    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 40)
    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CCW, 40)
    basic.pause(2000)
    mode = 0
    maqueen.motorStop(maqueen.Motors.All)
    basic.pause(100)
    mode = 11
    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, 40)
    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 40)
    basic.pause(2000)
    mode = 0
    maqueen.motorStop(maqueen.Motors.All)
    basic.showIcon(IconNames.Yes)
}
function set_motion (spd: number, rot: number) {
    motor_speed = Math.round(spd)
    if (motor_speed < 7) {
        motor_rotation = Math.round(rot)
    } else {
        motor_rotation = Math.round(rot * 1.2)
    }
}
function set_mode () {
    if (mode > 0) {
        if (distance < 6) {
            mode = 4
        } else if (distance < 11) {
            mode = 3
        }
        if (mode == 2) {
            if (line_state) {
                mode = 5
                mode_count = 50
            }
        }
        if ((mode == 3 || mode == 4) && distance > 11) {
            mode = 2
        }
    }
    if (mode == 5) {
        mode_count += -1
        if (mode_count <= 0) {
            mode = 2
        }
        if (left_line) {
            mode = 6
            mode_count = 50
        } else if (right_line) {
            mode = 7
            mode_count = 50
        }
    }
    if (mode == 6) {
        if (mode_count == 0) {
            mode = 8
        }
        mode_count += -1
    }
    if (mode == 7) {
        if (mode_count == 0) {
            mode = 9
        }
        mode_count += -1
    }
}
input.onButtonPressed(Button.A, function () {
    start_sequence()
})
function init_vars () {
    left_motor_hist = 15
    right_motor_hist = 17
    mag_millis_1 = []
    mag_millis_2 = []
    mag_angles_1 = []
    mag_angles_2 = []
}
input.onButtonPressed(Button.AB, function () {
    calibrate()
})
input.onButtonPressed(Button.B, function () {
    reset()
})
function blink_turn_signals () {
    signal_state = !(signal_state)
    if (motor_rotation < 0) {
        if (signal_state) {
            maqueen.writeLED(maqueen.LED.LEDLeft, maqueen.LEDswitch.turnOn)
        } else {
            maqueen.writeLED(maqueen.LED.LEDLeft, maqueen.LEDswitch.turnOff)
        }
        maqueen.writeLED(maqueen.LED.LEDRight, maqueen.LEDswitch.turnOff)
    } else if (motor_rotation > 0) {
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
    if (motor_speed != last_speed || motor_rotation != last_rotation) {
        left_speed = motor_speed + motor_rotation
        right_speed = motor_speed - motor_rotation
        last_speed = motor_speed
        last_rotation = motor_rotation
        if (left_speed > 0) {
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, left_motor_hist + left_speed)
        } else if (left_speed == 0) {
            maqueen.motorStop(maqueen.Motors.M1)
        } else {
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, left_motor_hist - left_speed)
        }
        if (right_speed > 0) {
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, right_motor_hist + right_speed)
        } else if (right_speed == 0) {
            maqueen.motorStop(maqueen.Motors.M2)
        } else {
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CCW, right_motor_hist - right_speed)
        }
    }
}
function read_sensors () {
    distance = maqueen.Ultrasonic(PingUnit.Centimeters)
    left_line = maqueen.readPatrol(maqueen.Patrol.PatrolLeft) == 0
    right_line = maqueen.readPatrol(maqueen.Patrol.PatrolRight) == 0
    line_state = 0
    if (left_line) {
        line_state += 1
    }
    if (right_line) {
        line_state += 2
    }
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
    time_step = control.millis() - last_millis
    last_millis += time_step
    counter += 1
    if (mode != 1 && counter % 10 == 0) {
        led.toggle(mode % 5, mode / 5)
    }
}
function follow_line (line_on: boolean, line_off: boolean, dir: number) {
    if (line_off) {
        if (speed > 5) {
            speed += -0.3
        }
        if (rotation * dir < -2) {
            rotation += dir * 2
        }
        rotation += dir * 1.6
        line_off_count += 1
    } else if (!(line_on)) {
        if (speed > 5.5) {
            speed += -0.25
        }
        if (rotation * dir > 2) {
            rotation += dir * -2
        }
        rotation += dir * -1
        not_line_on_count += 1
        line_off_count = 0
        if (not_line_on_count > 40) {
            mode = 5
            mode_count = 50
        }
    } else {
        if (speed < 7.4) {
            speed += 0.2
        }
        if (line_off_count != 0 || not_line_on_count != 0) {
            if (rotation > 3.7) {
                rotation = 3.7
            } else if (rotation < -3.7) {
                rotation = -3.7
            }
        }
        line_off_count = 0
        not_line_on_count = 0
    }
    if (rotation > 6.4) {
        rotation = 6.4
    } else if (rotation < -6.4) {
        rotation = -6.4
    }
    set_motion(speed, rotation)
}
function reset () {
    maqueen.motorStop(maqueen.Motors.All)
    control.reset()
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
        set_motion(-2, 0)
    } else if (mode == 6) {
        if (right_line) {
            set_motion(2, 5)
        } else if (!(left_line)) {
            set_motion(2, -5)
        } else {
            set_motion(2, 0)
        }
    } else if (mode == 7) {
        if (left_line) {
            set_motion(2, -5)
        } else if (!(right_line)) {
            set_motion(2, 5)
        } else {
            set_motion(2, 0)
        }
    } else if (mode == 8) {
        follow_line(left_line, right_line, 1)
    } else if (mode == 9) {
        follow_line(right_line, left_line, -1)
    } else if (mode == 10) {
        mag_millis_1.push(control.millis())
        mag_angles_1.push(input.compassHeading())
    } else if (mode == 11) {
        mag_millis_2.push(control.millis())
        mag_angles_2.push(input.compassHeading())
    } else if (mode != 0) {
        reset()
    }
}
let not_line_on_count = 0
let line_off_count = 0
let rotation = 0
let speed = 0
let counter = 0
let last_millis = 0
let time_step = 0
let right_speed = 0
let left_speed = 0
let last_rotation = 0
let last_speed = 0
let signal_state = false
let mag_angles_2: number[] = []
let mag_angles_1: number[] = []
let mag_millis_2: number[] = []
let mag_millis_1: number[] = []
let right_motor_hist = 0
let left_motor_hist = 0
let right_line = false
let left_line = false
let mode_count = 0
let line_state = 0
let distance = 0
let motor_rotation = 0
let motor_speed = 0
let mode = 0
let start_heading = 0
init_vars()
basic.forever(function () {
    read_sensors()
    heart_beat()
    set_mode()
    handle_mode()
    set_motors()
})
loops.everyInterval(100, function () {
    blink_turn_signals()
})
