import eu.akkalytics.et.gen.*
import org.junit.Test
import java.util.*
import kotlin.test.assertEquals
import kotlin.test.assertTrue

internal class DateMakerKtTest {

    /**
     * Test with the correct date pattern: yyyy-MM-dd
     */
    @Test
    fun stringToDate_Test_PASS() {
        val dateFromString = "1998-06-04".toDate()
        println("OUTPUT-TIME: ${dateFromString.time}")
        assertEquals(896918400000, dateFromString.time)
    }

    /**
     * Test with the wrong date pattern: dd/MM/yyyy
     */
    @Test
    fun stringToDate_Test_FAIL() {
        val actualDate = Date()
        val dateFromString = "04/06/1998".toDate()
        assertEquals(actualDate.toString(), dateFromString.toString())
    }

    /**
     * Test that ensures that the generated date
     * is between the min. date and max. date.
     */
    @Test
    fun makeRandomDateWithinRange_Test() {
        val minDate = "2019-01-01".toDate()
        val maxDate = "2019-06-04".toDate()
        val genDate = makeRandomDateWithinRange(minDate, maxDate)
        println("Generated date: $genDate")
        assertTrue(genDate > minDate, "The generated date should be bigger than 2019-01-01")
        assertTrue(genDate < maxDate, "The generated date should be smaller than 2019-06-04")
    }

    /**
     * Test validity of the first date of the year.
     */
    @Test
    fun firstDateOfTheActualYear_Test() {
        val genDate = firstDateOfTheActualYear()
        val actualYear = Calendar.getInstance().get(Calendar.YEAR)
        val calendar = Calendar.getInstance()
        calendar.time = genDate

        assertEquals(actualYear, calendar.get(Calendar.YEAR), "Year should be actual one")
        assertEquals(1, calendar.get(Calendar.MONTH) + 1, "Month should be JAN")
        assertEquals(1, calendar.get(Calendar.DAY_OF_MONTH), "Day should the first of JAN")
    }

    /**
     * Test validity of the last date of the year.
     */
    @Test
    fun lastDateOfTheActualYear_Test() {
        val genDate = lastDateOfTheActualYear()
        val actualYear = Calendar.getInstance().get(Calendar.YEAR)
        val calendar = Calendar.getInstance()
        calendar.time = genDate

        assertEquals(actualYear, calendar.get(Calendar.YEAR), "Year should be actual one")
        assertEquals(12, calendar.get(Calendar.MONTH) + 1, "Month should be DEC")
        assertEquals(31, calendar.get(Calendar.DAY_OF_MONTH), "Day should the last of DEC")
    }

    @Test
    fun periodToDate_Test() {
        val periodToConvert = 201910
        val dateFromPeriod = periodToDate(periodToConvert)
        println("DFP: $dateFromPeriod")
        val calendar = Calendar.getInstance()
        calendar.time = dateFromPeriod

        assertEquals(2019, calendar.get(Calendar.YEAR), "Year should be 2019")
        assertEquals(10, calendar.get(Calendar.MONTH) + 1, "Month should be OCT")
        assertEquals(1, calendar.get(Calendar.DAY_OF_MONTH), "Day should the first of OCT")
    }
}
