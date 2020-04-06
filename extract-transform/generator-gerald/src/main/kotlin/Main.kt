package eu.akkalytics.et.gen

import eu.akkalytics.et.gen.entities.GeneratedData
import eu.akkalytics.et.gen.entities.GenerationParams
import kotlinx.serialization.*
import kotlinx.serialization.internal.StringDescriptor
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonConfiguration
import java.io.File
import java.text.DateFormat
import java.text.SimpleDateFormat
import java.util.*

const val ANSI_RESET = "\u001B[0m"
const val ANSI_RED = "\u001B[31m"

/**
 * The maximal count of datasets
 * that should be in one file. If
 * this number is reached, the file
 * will be cleared and started over again.
 */
const val MAX_DATASETS = 100

/**
 * Defines how fast a new dataset should
 * be generated and written to the file.
 */
const val GENERATION_SPEED = 60_000L

/**
 * The name of file the where the generated
 * date should be placed.
 */
const val OUTPUT_FILE = "gen.json"

/**
 * The path where the file should
 * be generated.
 */
var filePath = ""

/**
 * Indicates if the program should start
 * with a clean file.
 */
var initWrite = true

/**
 * Keeps track of how many datasets are
 * already in the file.
 */
var datasetCount: Int = 0



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
        if (args.isNotEmpty()) {  println("   Content of the args: ${args[0]}") }
        else { println("Nothing passed - args is empty!")}
        return
    }

    /* Check and sets the file path argument if there is one */
    if (args.size == 2) { // File path provided
        val path = args[1]
        if (path[path.length - 1] == '/') { // Valid file path
            filePath = path + OUTPUT_FILE
        }
        else {  // Invalid file path
            println("$ANSI_RED! Invalid file path provided !$ANSI_RESET")
            println("   ERROR: Must end with /")
        }
    } else { // No file path provided
        filePath = OUTPUT_FILE
    }

    // Generate data
    if (generationParams != null) {
        // Validate parameters
        if (generationParams.validate()) {

            while (true) // Endless generation of data
            {
                // A new dataset will be created
                datasetCount++
                
                // Generate the data
                val genData = generateDataItem(generationParams)
                println("===============================")
                println("Content of genData:\n" +
                        "  $genData\n" +
                        " ")

                // Convert to a Json-String
                val jsonGenData = jsonSerializer.stringify(GeneratedData.serializer(), genData)
                println("Content of jsonGenData:\n" +
                        "  $jsonGenData\n" +
                        " ")
                println("===============================")
                println("Writing to the $OUTPUT_FILE ...")

                // Write the data to a file
                buildJsonFile(jsonGenData)
                Thread.sleep(GENERATION_SPEED) // Waits one minute for the next generation

                // Check if the max. dataset count has been reached
                if (datasetCount == MAX_DATASETS) {
                    // Clear the file and start over again
                    datasetCount = 0
                    initWrite = true
                }

            }

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

/**
 * Writes the provided String into an Json file.
 * Every restart of the whole program will result in an override.
 * @param genDataAsJson the generated data as a Json-String.
 */
fun buildJsonFile(genDataAsJson: String) {
    if (initWrite) {
        initWrite = false
        File(filePath).writeText(genDataAsJson)
    } else {
        File(filePath).appendText("\n" + genDataAsJson)
    }
}