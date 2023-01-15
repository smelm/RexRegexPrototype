define ipAddress as
    1 to 3 of DIGIT
    "."
    1 to 3 of DIGIT
    "."
    1 to 3 of DIGIT
    "."
    1 to 3 of DIGIT
end


define legalChar as
    any except of
        "<", ">", "(", ")", "[", "]"
        "\", ".", ",", ";", ":", "@"
        DOUBLE_QUOTE
        SPACE
    end
end

either
    many of legalChar
    0 to many of
        "."
        many of legalChar
    end
or
    DOUBLE_QUOTE
    many of any
    DOUBLE_QUOTE
end

"@"


either
    "["
    ipAddress
    "]"
or
    many of
        any of
            LETTER.EN
            DIGIT
            "-"
        end
    end
    "."
    2 to many of LETTER.EN
end

---

^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$

https://www.emailregex.com/

List of Valid Email Addresses

email@example.com
firstname.lastname@example.com
email@subdomain.example.com
firstname+lastname@example.com
email@123.123.123.123
email@[123.123.123.123]
"email"@example.com
1234567890@example.com
email@example-one.com
_______@example.com
email@example.name
email@example.museum
email@example.co.jp
firstname-lastname@example.com



List of Strange Valid Email Addresses

much.”more\ unusual”@example.com
very.unusual.”@”.unusual.com@example.com
very.”(),:;<>[]”.VERY.”very@\\ "very”.unusual@strange.example.com



List of Invalid Email Addresses

plainaddress
#@%^%#$@#$@#.com
@example.com
Joe Smith <email@example.com>
email.example.com
email@example@example.com
.email@example.com
email.@example.com
email..email@example.com
あいうえお@example.com
email@example.com (Joe Smith)
email@example
email@-example.com
email@example.web
email@111.222.333.44444
email@example..com
Abc..123@example.com



List of Strange Invalid Email Addresses

”(),:;<>[\]@example.com
just”not”right@example.com
this\ is"really"not\allowed@example.com
