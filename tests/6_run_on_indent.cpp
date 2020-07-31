#include <string>
#include <map>
#include <vector>

/*
 * Weeeeee comments
 *
 */
const int myVeryLongFunctionNameWhichWillGoOnForever(const std::map<std::string, std::string> &longParamOne,
                                                     const std::map<std::string, std::string> &longParamTwo,
                                                     const std::map<std::string, std::string> &longParamThree,
                                                       const std::map<std::string, std::string> *longParamFour)
{
    int currentReturnCode = 0;
    int returnCodeOk = 0;
    if (!(currentReturnCode == returnCodeOk || longParamOne.find("A nice long test string boop")->second == "test" ||
          longParamTwo.find("A nice long test string boop")->second == "test"))
    {
        currentReturnCode = anotherVeryLongFunctionNameWhichReallyHasNoBuisnessBeingThisLong(currentReturnCode,
                                                                                             returnCodeOk);
    }

    std::vector<std::string> aLongVectorList{"Test String One", "Test String Two", "Test String Three",
                                             "Test String Four", "Test String Five"};

     int anActualIncorrectIndent = 5;
     int *aPointerWithABadIndent = new int(5);
    return anActualIncorrectIndent;
}

const int anotherVeryLongFunctionNameWhichReallyHasNoBuisnessBeingThisLong(int itemOne, int itemTwo)
{
    return 0;
}
