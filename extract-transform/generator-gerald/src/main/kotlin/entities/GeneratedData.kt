package eu.akkalytics.et.gen.entities

import eu.akkalytics.et.gen.DateSerializer
import kotlinx.serialization.Serializable
import java.util.*

/***
 * The to be generated data which is shared via a JSON file.
 */
@Serializable
data class GeneratedData (
    // Provided by parameters
    val company: String,
    val plant: String,
    val importCountry: String,
    val periodRangeStart: Int,
    val periodRangeEnd: Int,

    /*              Generated data              */
    val declarationId: String,
    val shipmentId: String,
    val invoiceId: Int,
    val invoiceLineId: Int,

    val status: String,
    val originCountry: String,
    @Serializable(with = DateSerializer::class)
    val declarationDate: Date,
    val customOffice: String,
    val customOfficeOfEntry: String,
    val declarant: String,
    // val broker: String,
    val localReference: String,
    @Serializable(with = DateSerializer::class)
    val shipmentDate: Date,
    // @Serializable(with = DateSerializer::class)
    // val estimatedTimeOfArrival: Date,
    val modeOfTransportAtTheBorder: String,
    val modeOfTransportInland: String,
    val containerized: Boolean,
    val containerNumbers: String,
    val automationIndicator: String,

    val exporterAddressNumber: String,
    val exporterAddress: String,
    val exporterRegistrationNumber: String,
    val exporterName: String,
    val exporterRegion: String,
    val exporterCountry: String,

    val importerAddressNumber: String,
    val importerAddress: String,
    val importerRegistrationNumber: String,
    val importerName: String,
    val importerRegion: String,
    val importerCountry: String,

    val supplierAddressNumber: String,
    val supplierAddress: String,
    val supplierRegistrationNumber: String,
    val supplierName: String,
    val supplierRegion: String,
    val supplierCountry: String,

    val invoiceLineFrightCosts: Float,
    val invoiceLineInsuranceCosts: Float,
    val invoiceLineAdditionalCosts: Float,
    val invoiceLineGrossWeight: Float,
    val invoiceLineNetWeight: Float,
    val invoiceLineHSCode: String,
    val invoiceLineValue: Float,
    val invoiceLineQuantity: Int,
    val invoiceLineCustomValue: Float,
    val invoiceLineVAT: Float,
    val invoiceLineDuties: Float,
    // val invoiceLineSimulatedDuties: Float,
    // val invoiceLineOtherTaxes: Float,
    // val invoiceApplicableTariffs: String,
    // val invoiceLineAverageDutyRate: Float,
    val invoiceLinePreferentialCode: String,
    @Serializable(with = DateSerializer::class)
    val invoiceLineLastModified: Date,
    @Serializable(with = DateSerializer::class)
    val invoiceLastModified: Date,

    @Serializable(with = DateSerializer::class)
    val shipmentLastModified: Date,
    @Serializable(with = DateSerializer::class)
    val declarationLastModified: Date
)