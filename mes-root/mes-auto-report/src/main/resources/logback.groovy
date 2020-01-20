import ch.qos.logback.classic.filter.ThresholdFilter
import com.github.ixtf.japp.core.J

def logPath = System.getProperty("log.path")
if (J.isBlank(logPath)) {
    logPath = System.getProperty("mes.auto.report.path")
    if (J.isBlank(logPath)) {
        logPath = "/home/mes/auto/log"
    } else {
        logPath = logPath + "/log"
    }
}

def PATTERN = "%d{yyyy-MM-dd/HH:mm:ss} [%thread] %-5level %logger{35} - %msg%n"

appender("STDOUT", ConsoleAppender) {
    encoder(PatternLayoutEncoder) {
        pattern = PATTERN
    }
}

appender("ERROR_FILE", RollingFileAppender) {
    filter(ThresholdFilter) {
        level = ERROR
    }
    encoder(PatternLayoutEncoder) {
        pattern = PATTERN
    }
    rollingPolicy(SizeAndTimeBasedRollingPolicy) {
        fileNamePattern = logPath + "/error/%d{yyyy-MM-dd}.%i.txt"
        maxFileSize = "100MB"
        maxHistory = 100
        totalSizeCap = "20GB"
    }
}

appender("INFO_FILE", RollingFileAppender) {
    filter(ThresholdFilter) {
        level = INFO
    }
    encoder(PatternLayoutEncoder) {
        pattern = PATTERN
    }
    rollingPolicy(SizeAndTimeBasedRollingPolicy) {
        fileNamePattern = logPath + "/info/%d{yyyy-MM-dd}.%i.txt"
        maxFileSize = "100MB"
        maxHistory = 100
        totalSizeCap = "20GB"
    }
}

//logger("com.hengyi.japp.znwj", DEBUG, ["STDOUT"])
root(INFO, ["STDOUT", "ERROR_FILE", "INFO_FILE"])