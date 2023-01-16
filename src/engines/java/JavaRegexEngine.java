
import java.io.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import java.util.Collections;
import java.util.Map;
import java.lang.reflect.Method;
import java.lang.reflect.InvocationTargetException;

class JavaRegexEngine {

    public static void main(String args[]) throws Exception {
        var patternStr = args[0];
        var inputStr = args[1];

        var pattern = Pattern.compile(patternStr);
        var matcher = pattern.matcher(inputStr);

        var matches = matcher.find();


        System.out.println(matches);

        if(matches){
            var groups = getNamedGroups(pattern);
            for (String name: groups.keySet()) {
                System.out.println(name + ":" + matcher.group(name));
            }
        }
    }

    private static Map<String, Integer> getNamedGroups(Pattern regex) throws Exception{
        Method namedGroupsMethod = Pattern.class.getDeclaredMethod("namedGroups");
        namedGroupsMethod.setAccessible(true);

        Map<String, Integer> namedGroups = (Map<String, Integer>) namedGroupsMethod.invoke(regex);

        return Collections.unmodifiableMap(namedGroups);
    }
}
