q1 = """
select efpsid, efsvzdat, efpwert, efpmenge, efppac, efpurld, efptarnr, efaabart, efabemeh, efaabart, efsheld, mndland 
  from mic_einpos, mic_einkop, mic_einsdg, mic_einabg, mic_company
 where efpefksid = efksid
   and efkefssid = efssid
   and efsmandant = :1
   and efswerk = :2
   and efaefpsid = efpsid
   and efaabart = :3
   and mndmandant = efsmandant
"""

q2 = """
select efpsid SystemID, efsvzdat DeclarationDate, efpwert LineValue,efpmenge Quantity,EFPPac PreferencalCode, efpurld CountryOfOrigin,efptarnr HsCode, efaabart TaxType
  from mic_einpos, mic_einkop, mic_einsdg,mic_einabg
 where efpefksid = efksid
   and efkefssid = efssid
   and efsmandant = :1
   and efswerk = :2
   and efaefpsid = efpsid
   and efaabart = :3
"""

get_all_shipments_unique_id = """
select 
    efsperiode, efsbelnr 
from 
    mic_einsdg
where 
    efsmandant = :1
    and efswerk = :2
    and efsperiode like :3
"""

q1_map_desc = dict(efpsid="System ID", efsvzdat="Declaration Date", efpwert="Line Value", efpmenge="Quantity",
              efppac="Preferential Code", efpurld="Country Of Origin", efptarnr="HS Code", efaabart="Tax Amount",
              efabemeh="Tax Currency", efsheld="Shipping Country", mndland="Importing Country")

q1_map_name = dict(efpsid="systemId", efsvzdat="declarationDate", efpwert="lineValue", efpmenge="quantity",
              efppac="preferentialCode", efpurld="countryOfOrigin", efptarnr="hsCode", efaabart="taxAmount",
              efabemeh="taxCurrency", efsheld="shippingCountry", mndland="importingCountry")

get_basic_info = """
  with basic_information as (
    select 
           nvl(efsmesssstatus, '00') sendStatus, 
           nvl(efsmessrstatus, '00') receiveStatus, 
           rststatus encodedStatusName, 
           rstsymbol encodedStatusSymbol, 
           mmstext statusDescription,
           rstbelkz closureFlag,           
           efsMandant company,
           efsWerk plant,
           mndCtry importCountry,
           efsVzDat declarationDate,
           nvl(efsDestCustomsOffice, efdZost) customsOffice,
           null declarant, -- hard to determine, maybe need to build wrapper functions to do the job
           efsBroker broker,
           efsSdgId shipmentId,
           decode(efsCorrelationId, null, '0', '1') automationIndicator,  -- (0 = not automated, 1 = automated)           
           null shipFromAddressNumber,
           null shipFromRegistrationNumber,
           null shipFromName,
           null shipFromRegion,
           null shipFromCountry,
           null shipToAddressNumber,
           null shipToRegistrationNumber,
           null shipToName,
           null shipToRegion,
           null shipToCountry,           
           null supplierAddressNumber,
           null supplierRegistrationNumber,
           null supplierName,
           null supplierRegion,
           null supplierCountry,
           efsVzDat shipmentDate,
           efsVkzGr modeOfTransportAtBorder,
           null customsOfficeOfEntry,
           efsVkzIn modeOfTransportInland,
           nvl(efsCon, '0') containerized,
           efsContNo containerNumbers,                   
           efssid, efksid, efpsid,
           efpMessRegNr declarationid
                            
      from mic_einsdg, 
           mic_einkop, 
           mic_einpos, 
           mic_eindoc, 
           mic_eindocinh, 
           mic_company,
           mic_plant,
           mic_cust_recordstatus,
           mic_messagetext
     where efsMandant = :1   
       and efsWerk = :2
       and mndMandant = efsMandant
       and wrkMandant = mndMandant
       and wrkWerk = efsWerk
       and efsPeriode = :3 
       and efkefssid = efssid
       and efpefksid = efksid
       and efssid = ediefssid (+)
       and ediefdsid = efdsid (+)
       and rstmodul = 'IMPORT'
       and rstClear = wrkClearing
       and nvl(rstmesssstatus, '00') = nvl(efsMessSStatus, '00')
       and nvl(rstmessrstatus, '00') = nvl(efsMessRStatus, '00')
       and rstbelkz = decode(nvl(efsbelkz, '0'), 'A', '1', '0')
       and rstindex = mmsindex
       and rstnotfall = nvl(efsnotfall, '0')
       and rstuncompkz = nvl(efsuncompkz, '0')
       and rstdokanfkz = nvl(efsdokanfkz, '0')
       and rstaustrittkz = '0'
       and mmsspr = 'ENG'
    )
    select sendstatus, receivestatus, encodedstatusname, encodedstatussymbol, statusdescription,
           closureflag, company, plant, importcountry, declarationdate, customsoffice,
           declarant, broker, shipmentid, automationindicator, shipfromaddressnumber, shipfromregistrationnumber,
           shipfromname, shipfromregion, shipfromcountry, shiptoaddressnumber,
           shiptoregistrationnumber, shiptoname, shiptoregion, shiptocountry, supplieraddressnumber,
           supplierregistrationnumber, suppliername, supplierregion, suppliercountry, shipmentdate, modeoftransportatborder,
           customsofficeofentry, modeoftransportinland, containerized, containernumbers,
           count(efpsid) numberOfLines, count(efksid) numberOfInvoices, declarationid,
           cast(collect(to_number(efpsid)) as TTabSids) tabLineSids, 
           sum(decode(nvl(vatValues.efaAbgabe, 0), 0, nvl(vatValues.efaErrAbgabe, 0), nvl(vatValues.efaAbgabe,0))) sumVat,
           sum(decode(nvl(dutyValues.efaAbgabe,0), 0, nvl(dutyValues.efaErrAbgabe,0), nvl(dutyValues.efaAbgabe,0))) sumDuties,
           sum(decode(nvl(otherDutyValues.efaAbgabe,0), 0, nvl(otherDutyValues.efaErrAbgabe,0), nvl(otherDutyValues.efaAbgabe,0))) sumOtherDuties
      from basic_information, mic_einabg vatValues, mic_einabg dutyValues, mic_einabg otherDutyValues
     where vatValues.efaAbArt (+) = '710' and vatValues.efaefpsid (+) = efpsid
       and dutyValues.efaAbArt (+) = '760' and dutyValues.efaefpsid (+) = efpsid
       and otherDutyValues.efaAbArt (+) not in ('710', '760') and otherDutyValues.efaefpsid (+) = efpsid
     group by sendstatus, receivestatus, encodedstatusname, encodedstatussymbol, statusdescription,
              closureflag, company, plant, importcountry, declarationdate, customsoffice,
              declarant, broker, shipmentid, automationindicator, shipfromaddressnumber, shipfromregistrationnumber,
              shipfromname, shipfromregion, shipfromcountry, shiptoaddressnumber,
              shiptoregistrationnumber, shiptoname, shiptoregion, shiptocountry, supplieraddressnumber,
              supplierregistrationnumber, suppliername, supplierregion, suppliercountry, shipmentdate, modeoftransportatborder,
              customsofficeofentry, modeoftransportinland, containerized, containernumbers, declarationid
"""

get_basic_info_v2 = """
select
    partName, shipmentSystemId, shipmentHeadSystemId, shipmentLineSystemId, company, plant, declarationdate, 
    shipmentid, declarationid ,sendstatus, receivestatus, encodedstatusname, encodedstatussymbol, 
    statusdescription, closureflag,  importcountry,  customsoffice, declarant, broker,  automationindicator, 
    shipfromaddressnumber, shipfromregistrationnumber, shipfromname, shipfromregion, shipfromcountry, 
    shiptoaddressnumber, shiptoregistrationnumber, shiptoname, shiptoregion, shiptocountry, supplieraddressnumber,
    supplierregistrationnumber, suppliername, supplierregion, suppliercountry, shipmentdate, modeoftransportatborder,
    customsofficeofentry, modeoftransportinland, containerized, containernumbers,
    sum(duty) sumDuty,
    sum(vat)  sumVat,
    sum(other) sumOther  
    from(
select efpartnr partName, 
           efssid shipmentSystemId, 
           efksid shipmentHeadSystemId, 
           efpsid shipmentLineSystemId, 
           efaabart,
           efaAbgabe,
           efsMandant company,
           efsWerk plant, 
           efpMessRegNr declarationid,
           efsVzDat declarationDate,
           efsSdgId shipmentId,
           nvl(efsmesssstatus, '00') sendStatus, 
           nvl(efsmessrstatus, '00') receiveStatus, 
           rststatus encodedStatusName, 
           rstsymbol encodedStatusSymbol, 
           mmstext statusDescription,
           rstbelkz closureFlag, 
           mndCtry importCountry,
           nvl(efsDestCustomsOffice, efdZost) customsOffice,
           null declarant, -- hard to determine, maybe need to build wrapper functions to do the job
           efsBroker broker,
           decode(efsCorrelationId, null, '0', '1') automationIndicator,  -- (0 = not automated, 1 = automated)           
           efklfrnr shipFromAddressNumber,
           efklfreori shipFromRegistrationNumber,
           null shipFromName,
           null shipFromRegion,
           null shipFromCountry,
           null shipToAddressNumber,
           null shipToRegistrationNumber,
           null shipToName,
           null shipToRegion,
           null shipToCountry,           
           null supplierAddressNumber,
           null supplierRegistrationNumber,
           null supplierName,
          null supplierRegion,
           null supplierCountry,
           efsVzDat shipmentDate,
           efsVkzGr modeOfTransportAtBorder,
           null customsOfficeOfEntry,
           efsVkzIn modeOfTransportInland,
           nvl(efsCon, '0') containerized,
           efsContNo containerNumbers,                   
           decode(efaabart,'760',efaAbgabe,0) duty,
           decode(efaabart,'710',efaAbgabe,0) vat,
           decode(efaabart,'760',0,'710',0,efaabgabe) other
      from mic_einsdg, 
           mic_einkop, 
           mic_einpos, 
           mic_einabg,
           mic_eindoc, 
           mic_eindocinh, 
           mic_company,
           mic_plant,
           mic_cust_recordstatus,
           mic_messagetext
     where efsMandant = :1   
       and efsWerk = :2
       and mndMandant = efsMandant
       and wrkMandant = mndMandant
       and wrkWerk = efsWerk
       and efsPeriode = :3 
       and efkefssid = efssid
       and efpefksid = efksid
       and efaefpsid = efpsid
       and efssid = ediefssid (+)
       and ediefdsid = efdsid (+)
       and rstmodul = 'IMPORT'
       and rstClear = wrkClearing
       and nvl(rstmesssstatus, '00') = nvl(efsMessSStatus, '00')
       and nvl(rstmessrstatus, '00') = nvl(efsMessRStatus, '00')
       and rstbelkz = decode(nvl(efsbelkz, '0'), 'A', '1', '0')
       and rstindex = mmsindex
       and rstnotfall = nvl(efsnotfall, '0')
       and rstuncompkz = nvl(efsuncompkz, '0')
       and rstdokanfkz = nvl(efsdokanfkz, '0')
       and rstaustrittkz = '0'
       and mmsspr = 'ENG')
     group by shipmentSystemId, shipmentHeadSystemId, shipmentLineSystemId, sendstatus, receivestatus, encodedstatusname, encodedstatussymbol, statusdescription,
              closureflag, company, plant, importcountry, declarationdate, customsoffice,
              declarant, broker, shipmentid, automationindicator, shipfromaddressnumber, shipfromregistrationnumber,
              shipfromname, shipfromregion, shipfromcountry, shiptoaddressnumber,
              shiptoregistrationnumber, shiptoname, shiptoregion, shiptocountry, supplieraddressnumber,
              supplierregistrationnumber, suppliername, supplierregion, suppliercountry, shipmentdate, modeoftransportatborder,
              customsofficeofentry, modeoftransportinland, containerized, containernumbers, declarationid, partName
"""