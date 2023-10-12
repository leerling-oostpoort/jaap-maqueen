"""

Modes:

0: reset

1: startup

2: look for line

3: stop

4: backup 

5: line detected

6: line detected on left

7: line detected on right

8: line follow

"""
def set_motion(spd: number, rot: number):
    global speed, rotation
    speed = spd
    rotation = rot
def set_mode():
    global mode, mode_count
    if mode > 0:
        if distance < 7:
            mode = 4
        elif distance < 12:
            mode = 3
        if mode == 2:
            if line_state:
                mode = 5
        if (mode == 3 or mode == 4) and distance > 11:
            mode = 2
    else:
        pass
    if mode == 5:
        if left_line:
            mode = 6
            mode_count = 50
        elif right_line:
            mode = 7
            mode_count = 50
    if mode == 6:
        if mode_count == 0:
            mode = 8
        mode_count += -1
    if mode == 7:
        if mode_count == 0:
            mode = 9
        mode_count += -1

def on_button_pressed_a():
    start_sequence()
input.on_button_pressed(Button.A, on_button_pressed_a)

def on_button_pressed_b():
    maqueen.motor_stop(maqueen.Motors.ALL)
    control.reset()
input.on_button_pressed(Button.B, on_button_pressed_b)

def blink_turn_signals():
    global signal_state
    signal_state = not (signal_state)
    if rotation < 0:
        if signal_state:
            maqueen.write_led(maqueen.LED.LED_LEFT, maqueen.LEDswitch.TURN_ON)
        else:
            maqueen.write_led(maqueen.LED.LED_LEFT, maqueen.LEDswitch.TURN_OFF)
        maqueen.write_led(maqueen.LED.LED_RIGHT, maqueen.LEDswitch.TURN_OFF)
    elif rotation > 0:
        if signal_state:
            maqueen.write_led(maqueen.LED.LED_RIGHT, maqueen.LEDswitch.TURN_ON)
        else:
            maqueen.write_led(maqueen.LED.LED_RIGHT, maqueen.LEDswitch.TURN_OFF)
        maqueen.write_led(maqueen.LED.LED_LEFT, maqueen.LEDswitch.TURN_OFF)
    else:
        maqueen.write_led(maqueen.LED.LED_LEFT, maqueen.LEDswitch.TURN_OFF)
        maqueen.write_led(maqueen.LED.LED_RIGHT, maqueen.LEDswitch.TURN_OFF)
def set_motors():
    global left_speed, right_speed, last_speed, last_rotation
    if speed != last_speed or rotation != last_rotation:
        left_speed = speed + rotation
        right_speed = speed - rotation
        last_speed = speed
        last_rotation = rotation
        if left_speed > 0:
            maqueen.motor_run(maqueen.Motors.M1, maqueen.Dir.CW, motor_hist + left_speed)
        elif left_speed == 0:
            maqueen.motor_stop(maqueen.Motors.M1)
        else:
            maqueen.motor_run(maqueen.Motors.M1, maqueen.Dir.CCW, motor_hist - left_speed)
        if right_speed > 0:
            maqueen.motor_run(maqueen.Motors.M2, maqueen.Dir.CW, motor_hist + right_speed)
        elif right_speed == 0:
            maqueen.motor_stop(maqueen.Motors.M2)
        else:
            maqueen.motor_run(maqueen.Motors.M2, maqueen.Dir.CCW, motor_hist - right_speed)
def read_sensors():
    global distance, left_line, right_line, line_state
    distance = maqueen.ultrasonic(PingUnit.CENTIMETERS)
    left_line = maqueen.read_patrol(maqueen.Patrol.PATROL_LEFT) == 0
    right_line = maqueen.read_patrol(maqueen.Patrol.PATROL_RIGHT) == 0
    line_state = 0
    if left_line:
        line_state += 1
    if right_line:
        line_state += 2
def start_sequence():
    global mode
    mode = 1
    basic.show_string("3")
    basic.pause(500)
    basic.show_string("2")
    basic.pause(500)
    basic.show_string("1")
    basic.pause(500)
    basic.show_string("0")
    basic.pause(500)
    basic.clear_screen()
    mode = 2
def heart_beat():
    global step, last_millis, counter
    step = control.millis() - last_millis
    last_millis += step
    counter += 1
    if mode != 1 and counter % 10 == 0:
        led.toggle(mode % 5, mode / 5)
def handle_mode():
    if mode == 1:
        set_motion(0, 0)
    elif mode == 2:
        set_motion(15, 0)
    elif mode == 3:
        set_motion(0, 0)
    elif mode == 4:
        set_motion(-8, 0)
    elif mode == 5:
        set_motion(-2, 0)
    elif mode == 6:
        if right_line:
            set_motion(2, 5)
        elif not (left_line):
            set_motion(2, -5)
        else:
            set_motion(1, 0)
    elif mode == 7:
        if left_line:
            set_motion(2, -5)
        elif not (right_line):
            set_motion(2, 5)
        else:
            set_motion(1, 0)
    elif mode == 8:
        pass
    elif mode == 9:
        pass
    else:
        pass
counter = 0
last_millis = 0
step = 0
right_speed = 0
left_speed = 0
last_rotation = 0
last_speed = 0
signal_state = False
mode_count = 0
right_line = False
left_line = False
line_state = 0
distance = 0
mode = 0
rotation = 0
speed = 0
motor_hist = 0
motor_hist = 15

def on_forever():
    read_sensors()
    heart_beat()
    set_mode()
    handle_mode()
    set_motors()
basic.forever(on_forever)

def on_every_interval():
    blink_turn_signals()
loops.every_interval(100, on_every_interval)
