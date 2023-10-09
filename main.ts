basic.forever(function () {
    if (maqueen.Ultrasonic(PingUnit.Centimeters) < 8) {
        maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CCW, 20)
    } else if (maqueen.Ultrasonic(PingUnit.Centimeters) < 12) {
        maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CW, 0)
    } else {
        maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CW, 45)
    }
})
