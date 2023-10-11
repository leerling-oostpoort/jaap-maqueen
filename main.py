def move():
    if distance < 8:
        maqueen.motor_run(maqueen.Motors.M1, maqueen.Dir.CCW, left_backward)
        maqueen.motor_run(maqueen.Motors.M2, maqueen.Dir.CCW, right_backward)
    elif distance < 12:
        maqueen.motor_run(maqueen.Motors.ALL, maqueen.Dir.CW, 0)
    else:
        maqueen.motor_run(maqueen.Motors.M1, maqueen.Dir.CW, left_forward)
        maqueen.motor_run(maqueen.Motors.M2, maqueen.Dir.CW, right_forward)
def set_direction():
    global left_forward, right_forward
    left_forward = 45
    right_forward = 45
    if direction < 0:
        left_forward = left_forward + direction * 5
    elif direction > 0:
        right_forward = right_forward - direction * 5
    else:
        pass
left_line = 0
right_line = 0
right_forward = 0
left_forward = 0
distance = 0
direction = 0
right_backward = 0
left_backward = 0
left_backward = 20
right_backward = 22
direction = 0
set_direction()

def on_forever():
    global distance, right_line, left_line
    distance = maqueen.ultrasonic(PingUnit.CENTIMETERS)
    right_line = maqueen.read_patrol(maqueen.Patrol.PATROL_RIGHT)
    left_line = maqueen.read_patrol(maqueen.Patrol.PATROL_LEFT)
    move()
basic.forever(on_forever)
