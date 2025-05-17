const express = require('express');
const bodyParser = require('body-parser');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');

const app = express();
app.use(bodyParser.text({ type: 'text/xml' }));

const parser = new XMLParser({ ignoreAttributes: false });
const builder = new XMLBuilder({ ignoreAttributes: false });

app.post('/CreateUserService', (req, res) => {
  const xml = req.body;
  console.log('Received SOAP request:', xml);
  const jsonObj = parser.parse(xml);

  // Get SOAP Body
  const body = jsonObj['soapenv:Envelope']?.['soapenv:Body'] || jsonObj['soap:Envelope']?.['soap:Body'];
  const addUser = body?.['tns:addUser'] || body?.['addUser'];

  if (addUser) {
    console.log('Received SOAP addUser:', addUser);

    // Build SOAP Response
    const jsonResponse = {
      'soapenv:Envelope': {
        '@_xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
        '@_xmlns:tns': 'http://example.com/CreateUserService',
        'soapenv:Body': {
          'tns:CreateUserResponse': {
            status: 'User added successfully'
          }
        }
      }
    };

    const soapResponse = builder.build(jsonResponse);
    res.type('text/xml').send(soapResponse);
  } else {
    res.status(400).send('Invalid SOAP Request');
  }
});

app.listen(54333, () => {
  console.log('🚀 SOAP-like Express server running at http://localhost:3000/CreateUserService');
});
