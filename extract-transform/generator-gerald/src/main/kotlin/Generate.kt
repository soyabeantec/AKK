package eu.akkalytics.et.gen

import com.github.javafaker.Faker
import eu.akkalytics.et.gen.entities.*
import java.util.*
import kotlin.random.Random.Default.nextBoolean

/**
 *
 */
class Generate(private val generationParams: GenerationParams) {
    companion object {
        /**
         * The characters which are allowed for the random string generation at 'Int.getRandomString'
         */
        private const val ALLOWED_CHARACTERS = "0123456789QWERTZUIOPASDFGHJKLYXCVBNM"
        /**
         * All the possible status a shipment can have.
         */
        val POSSIBLE_STATUS = arrayOf(
            "CLOSED",
            "DACC",
            "DEACT",
            "DERR",
            "DESENT",
            "DSENT",
            "NDERR",
            "NDFB",
            "NDSENT",
            "OPEN",
            "SDERR")
        /**
         * All the status that indicate that a shipment has taken place.
         */
        val SENT_STATUS = arrayOf(
            "DESENT",
            "DSENT",
            "NDSENT"
        )
        /**
         * All the modes of transport available to a shipment.
         */
        val MODES_OF_TRANSPORT = arrayOf(
            "Train",
            "Ship",
            "Airplane",
            "Truck"
        )
    }

    // region Date range decision process

    /**
     * Zero means that the periods should not be used -> use the actual year and date
     */
    private val periodsGiven = !(generationParams.periodRangeStart == 0 && generationParams.periodRangeEnd == 0)

    /**
     * Start date for the generated dates.
     * Todo explain min date better
     */
    private val minDate = if (periodsGiven) {
        periodToDate(generationParams.periodRangeStart)
    } else { firstDateOfTheActualYear() }

    /**
     * The last date that should be used in the generated dates.
     * Todo explain last date better
     */
    private val lastDate = if (periodsGiven) {
        periodToDate(generationParams.periodRangeEnd)
    } else { lastDateOfTheActualYear() }

    /**
     * The date of 'today' for reuse.
     * Todo explain today date better
     */
    private val todayDate = if (periodsGiven) {
        makeRandomDateWithinRange(minDate, lastDate)
    } else { Date() }


    // endregion


    // Vals set by the private generator functions
    val shipmentId = genShipmentId()
    val status = genStatus()
    val declarationDate: Date = genDeclarationDate()
    val shipmentDate: Date = genShipmentDate()
    val containerized: Boolean = genContainerized()
    val exporter: Participant = genExporter()
    val importer: Participant = genImporter()
    val supplier: Participant = genSupplier()
    val invoiceLine: InvoiceLine = genInvoiceLine()
    val invoiceLastModified: Date = genInvoiceLastModified()

    /**
     * Indicator if the shipment already has been sent
     */
    private val sent = SENT_STATUS.contains(status)

    // region Helper Functions

    /**
     * Int extension function that:
     * Generates a random string with the length according to the
     * Int value. Uses only the ALLOWED_CHARACTERS for the generation.
     * Example: 2.getRandomString() will generate something like this: "BK"
     * @return a random string with the provided length.
     */
    private fun Int.getRandomString(): String {
        val random = Random()
        val sb = StringBuilder(this)
        for (i in 0 until this)
            sb.append(ALLOWED_CHARACTERS[random.nextInt(ALLOWED_CHARACTERS.length)])
        return sb.toString()
    }

    /**
     * String extension function that:
     * Generates random numbers until the whole string has a length of 6.
     * @returns a string with random numbers, e.g. AT5050
     */
    private fun String.addRandomNum(): String {
        return if (this.length < 6) {
            (this + (0 until 10).random()).addRandomNum()
        } else {
            this
        }
    }

    // endregion

    // region Private Generator-Functions

    /**
     * Generates a random shipment identification.
     * @return the id as a six character string.
     */
    private fun genShipmentId(): String {
        val idSize = 6
        return idSize.getRandomString()
    }

    /**
     * Randomly returns one the possible status.
     * @return the status as a string, e.g 'OPEN'
     */
    private fun genStatus(): String {
        return POSSIBLE_STATUS[(POSSIBLE_STATUS.indices).random()]
    }

    /**
     * Generates a declaration date between the first day of the year and
     * the actual day.
     * @return the generated date as a Date obj.
     */
    private fun genDeclarationDate(): Date {
        return makeRandomDateWithinRange(minDate, todayDate)
    }

    /**
     * Generates a shipment date between the actual day and the last day or
     * between the 'declarationDate' and the actual day if the shipment has
     * a sent-status.
     * @return the generated date as a Date obj.
     */
    private fun genShipmentDate(): Date {
        var minDate = todayDate
        var maxDate = lastDate

        // Shipment has already happened
        if (sent) {
            minDate = declarationDate
            maxDate = todayDate
        }

        return makeRandomDateWithinRange(minDate, maxDate)
    }

    /**
     * Randomly chooses if the shipment is containerized.
     * @return 'true' or 'false' as a string.
     */
    private fun genContainerized(): Boolean {
        return nextBoolean()
    }

    /**
     * Randomly chooses one exporter form the EXPORTERS array.
     * @return the exporter as a Participant obj.
     */
    private fun genExporter(): Participant {
        return EXPORTERS[(EXPORTERS.indices).random()]
    }

    /**
     * Randomly chooses one importer form the IMPORTERS array.
     * @return the importer as a Participant obj.
     */
    private fun genImporter(): Participant {
        return IMPORTERS[(IMPORTERS.indices).random()]
    }

    /**
     * Randomly chooses one supplier form the SUPPLIERS array.
     * @return the supplier as a Participant obj.
     */
    private fun genSupplier(): Participant {
        return SUPPLIERS[(SUPPLIERS.indices).random()]
    }

    /**
     * Generate a new invoice line with the help of the
     * shipmentDate, min. date, today date and sent status.
     * @return the invoice line as a InvoiceLine obj.
     */
    private fun genInvoiceLine(): InvoiceLine {
        val invoiceLineGenerator = InvoiceLineGenerator(shipmentDate, minDate, todayDate, sent)
        return invoiceLineGenerator.makeNewInvoiceLine()
    }

    /**
     * Generates a day between the last invoiceLine modification and the declaration date.
     * @return the day of the last modification as a Date obj.
     */
    private fun genInvoiceLastModified(): Date {
        val minDate = invoiceLine.lastModified
        val maxDate = if (sent) { shipmentDate } else { todayDate }
        return makeRandomDateWithinRange(minDate, maxDate)
    }

    // endregion

    // region Public Generator-Functions

    /**
     * Generates a random 6 character string as the declarant id.
     * @return the declaration id as a string.
     */
    fun genDeclarationId(): String {
        val idSize = 6
        return idSize.getRandomString()
    }

    /**
     * Generates a InvoiceId with the range 10001 - 20000
     * and displays it in the console.
     * @return the generated value as an Integer, e.g. 100200
     */
    fun genInvoiceId(): Int {
        return (1..10000).random() + 10000
    }

    /**
     * Generates the InvoiceLineId with the range 1-1000
     * @return the generated value as an integer, e.g 44
     */
    fun genInvoiceLineId(): Int {
        return (1..100).random()
    }

    /**
     * Randomly returns one the existing countries,
     * excluding the import country from the generationParams.
     * @return the country code as a string, e.g. 'US'
     */
    fun genOriginCountry(): String {
        var res: String

        // Import and origin country should not be the same
        do { res = COUNTRIES.random().code } while (res == generationParams.importCountry)

        println("genOriginCountry: $res")
        return res
    }

    /**
     * Randomly returns a custom office,
     * with a country prefix according to the 'importCountry'
     * provided in the 'generationParams'
     * @returns the custom office code as a string, e.g. 'DE5432'
     */
    fun genCustomOffice(): String {
        val res = generationParams.importCountry
        return res.addRandomNum()
    }

    /**
     * Uses the Faker library to generate a realistic
     * sounding name to name the declarant.
     * @return a full name as a string, e.g. "Mr. Max Muster"
     */
    fun genDeclarant(): String {
        val faker = Faker()
        return faker.name().fullName()
    }

    /**
     * Uses the same value as the one
     * generated for the shipmentId.
     * @return the local reference as a string.
     */
    fun genLocalReference(): String {
        return shipmentId;
    }

    /**
     * Generates a random container number to the prefix "CO", but
     * only if the shipment is containerized, if that is not the
     * case a emtpy string will be used instead.
     * @return a container number, e.g. "CO7897" as a string.
     */
    fun genContainerNumbers(): String {
        var res = ""

        if (containerized) {
            val cnt = (1..10).random()
            val prefix = "CO"
            for(i in 1..cnt) {
                if (i != 1) { res += ";" }
                res += prefix.addRandomNum()
            }
        }

        return res
    }

    /**
     * Randomly chooses the automation indicator.
     * @returns 'true' or 'false' as a string.
     */
    fun genAutomationIndicator(): String {
        val randomBool = nextBoolean()
        return randomBool.toString()
    }

    /**
     * Randomly chooses one of four possible modes
     * of transport.
     * @return the name of the transport method
     */
    fun genModeOfTransport(): String {
        return MODES_OF_TRANSPORT[(MODES_OF_TRANSPORT.indices).random()]
    }

    /**
     * Generates a day between the declaration date and the actual date, if
     * the shipment has already been sent, the shipment date will be used instead.
     * @return the day of the last modification as a Date obj.
     */
    fun genShipmentLastModified(): Date {
        val minDate = declarationDate
        val maxDate =  if (sent) { shipmentDate } else { todayDate }
        return makeRandomDateWithinRange(minDate, maxDate)
    }

    /**
     * Generates a day between the last invoice modification or declaration date, depending on
     * which one is later and the actual date, if the shipment has already been sent, the
     * shipment date will be used instead of the actual date.
     * @return the day of the last modification as a Date obj.
     */
    fun genDeclarationLastModified(): Date {
        val minDate = if (invoiceLastModified < declarationDate ) { declarationDate } else { invoiceLastModified }
        val maxDate =  if (sent) { shipmentDate } else { todayDate }
        return makeRandomDateWithinRange(minDate, maxDate)
    }

    // endregion
}