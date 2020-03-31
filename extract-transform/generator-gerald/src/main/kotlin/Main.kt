package eu.akkalytics.et.gen

import eu.akkalytics.et.gen.entities.GeneratedData
import eu.akkalytics.et.gen.entities.GenerationParams
import eu.akkalytics.et.gen.entities.validCountryCode
import kotlinx.serialization.*
import kotlinx.serialization.internal.StringDescriptor
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonConfiguration
import java.text.DateFormat
import java.text.SimpleDateFormat
import java.util.*

const val ANSI_RESET = "\u001B[0m"
const val ANSI_RED = "\u001B[31m"

/**
 * Custom serializer for the 'Date' class from java.util.
 * Because there is no serialization for 'Date', due to the
 * fact that it is a Java class and Kotlinx only supports real Kotlin data types.
 * Ref.: https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/custom_serializers.md
 */
@Serializer(forClass = Date::class)
object DateSerializer: KSerializer<Date> {
    private val dateFormat: DateFormat = SimpleDateFormat("yyyy-MM-dd")

    override val descriptor: SerialDescriptor =
        StringDescriptor.withName("WhitCustomDefault")

    override fun deserialize(decoder: Decoder): Date {
        return dateFormat.parse(decoder.decodeString())
    }

    override fun serialize(encoder: Encoder, obj: Date) {
        encoder.encodeString(dateFormat.format(obj))
    }
}

fun main(args: Array<String>) {
    val jsonSerializer = Json(JsonConfiguration.Stable)
    // val generatedDataCollection = listOf<GeneratedData>()
    var generationParams: GenerationParams? = null

    // Greeting
    println("Hello, I'm the generator Gerald!")

    // Parse the arguments to a 'Parameters' object
    try {
        generationParams = jsonSerializer.parse(GenerationParams.serializer(), args[0])
        println("Content of parameters: $generationParams")
        println("Content of the args: ${args[0]}")

    } catch (e: Exception) {
        println("$ANSI_RED! Could not parse the JSON !$ANSI_RESET")
        println("   ERROR: $e")
        println("   Content of the args: ${args[0]}")
    }

    // Generate data
    if (generationParams != null) {
        // Validate parameters
        if (generationParams.validate()) {
            val genData = generateDataItem(generationParams)
            println("Content of genData: $genData")
            val jsonGenData = jsonSerializer.stringify(GeneratedData.serializer(), genData)
            println("Content of jsonGenData: $jsonGenData")
        } else {
            println("$ANSI_RED! Parameters are not valid !$ANSI_RESET")
        }

    }
}

/**
 *
 */
fun generateDataItem(generationParams: GenerationParams): GeneratedData {
    val generate = Generate(generationParams)

    return GeneratedData(
        company = generationParams.company,
        plant = generationParams.plant,
        importCountry = generationParams.importCountry,
        periodRangeStart = generationParams.periodRangeStart,
        periodRangeEnd = generationParams.periodRangeEnd,

        declarationId = generate.genDeclarationId(),
        shipmentId = generate.shipmentId,
        invoiceId = generate.genInvoiceId(),
        invoiceLineId = generate.genInvoiceLineId(),

        status = generate.status,
        originCountry = generate.genOriginCountry(),
        declarationDate = generate.declarationDate,
        customOffice = generate.genCustomOffice(),
        customOfficeOfEntry = generate.genCustomOffice(),
        declarant = generate.genDeclarant(),
        localReference = generate.genLocalReference(),
        shipmentDate = generate.shipmentDate,
        modeOfTransportAtTheBorder = generate.genModeOfTransport(),
        modeOfTransportInland = generate.genModeOfTransport(),
        containerized = generate.containerized,
        containerNumbers = generate.genContainerNumbers(),
        automationIndicator = generate.genAutomationIndicator(),
        
        exporterAddressNumber = generate.exporter.addressNumber,
        exporterAddress = generate.exporter.address,
        exporterRegistrationNumber = generate.exporter.registrationNumber,
        exporterName = generate.exporter.name,
        exporterRegion = generate.exporter.region,
        exporterCountry = generate.exporter.country,

        importerAddressNumber = generate.importer.addressNumber,
        importerAddress =  generate.importer.address,
        importerRegistrationNumber =  generate.importer.registrationNumber,
        importerName =  generate.importer.name,
        importerRegion =  generate.importer.region,
        importerCountry =  generate.importer.country,

        supplierAddressNumber = generate.supplier.addressNumber,
        supplierAddress = generate.supplier.address,
        supplierRegistrationNumber = generate.supplier.registrationNumber,
        supplierName = generate.supplier.name,
        supplierRegion = generate.supplier.region,
        supplierCountry = generate.supplier.country,

        invoiceLineFrightCosts = generate.invoiceLine.frightCosts,
        invoiceLineInsuranceCosts = generate.invoiceLine.insuranceCosts,
        invoiceLineAdditionalCosts = generate.invoiceLine.additionalCosts,
        invoiceLineGrossWeight = generate.invoiceLine.grossWeight,
        invoiceLineNetWeight = generate.invoiceLine.netWeight,
        invoiceLineHSCode = generate.invoiceLine.hsCode,
        invoiceLineValue = generate.invoiceLine.value,
        invoiceLineQuantity = generate.invoiceLine.quantity,
        invoiceLineCustomValue = generate.invoiceLine.customValue,
        invoiceLineVAT = generate.invoiceLine.vat,
        invoiceLineDuties = generate.invoiceLine.duties,
        invoiceLinePreferentialCode = generate.invoiceLine.preferentialCode,
        invoiceLineLastModified = generate.invoiceLine.lastModified,

        invoiceLastModified = generate.invoiceLastModified,
        shipmentLastModified = generate.genShipmentLastModified(),
        declarationLastModified = generate.genDeclarationLastModified()
    )
}

fun buildJson() {
    TODO("Implement buildJson")
}