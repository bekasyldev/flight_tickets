import React from 'react';
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components';

interface FlightTicketEmailProps {
  bookingReference: string;
  flightNumber: string;
  flightDate: string;
  duration: string;
  departure: {
    time: string;
    airportCode: string;
    cityName: string;
    terminal: string;
  };
  arrival: {
    time: string;
    airportCode: string;
    cityName: string;
    terminal: string;
  };
  operatedBy: string;
  passenger: {
    name: string;
    baggage: string;
    class: string;
    seat: string;
  };
  pricing: {
    fare: string;
    fees: string;
    total: string;
    currency: string;
  };
}

export function FlightTicketEmail({
  bookingReference,
  flightNumber,
  flightDate,
  duration,
  departure,
  arrival,
  operatedBy,
  passenger,
  pricing
}: FlightTicketEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Flight Confirmation - {bookingReference}</Preview>
      <Body style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: '#f5f5f5',
        margin: 0,
        padding: '20px'
      }}>
        <Container style={{
          background: '#e8e1f5',
          borderRadius: '12px',
          maxWidth: '300px',
          width: '100%',
          border: '1px solid #023e8a',
          margin: '0 auto'
        }}>
          <Section style={{
            borderRadius: '12px 12px 0 0',
            background: '#a2d2ff',
            padding: '20px',
            textAlign: 'center'
          }}>
            <Text style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'black',
              marginBottom: '8px',
              letterSpacing: '1px',
              margin: '0 0 8px 0'
            }}>
              BOOKING CONFIRMED
            </Text>
            <Text style={{
              fontSize: '14px',
              color: '#333',
              margin: 0
            }}>
              Confirmation code: <strong style={{ color: '#003049', fontWeight: 'bold' }}>{bookingReference}</strong>
            </Text>
          </Section>

          <Section style={{
            padding: '20px',
            background: 'white',
            borderBottom: '2px solid #023e8a'
          }}>
            <Row style={{ marginBottom: '15px' }}>
              <Column style={{ color: '#023e8a', fontSize: '14px' }}>
                Flight: <span style={{ color: 'black' }}>{flightNumber}</span>
              </Column>
              <Column style={{ color: '#023e8a', fontSize: '14px', textAlign: 'right' }}>
                Date: <span style={{ color: 'black' }}>{flightDate}</span>
              </Column>
            </Row>

            <Section style={{
              textAlign: 'center',
              margin: '20px 0'
            }}>
              <Text style={{
                fontSize: '24px',
                color: '#9b87c4',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>✈</Text>
              <Text style={{
                fontSize: '14px',
                color: '#9b87c4',
                fontWeight: 'bold',
                margin: 0
              }}>{duration}</Text>
            </Section>

            <Row style={{ margin: '20px 0' }}>
              <Column style={{ flex: 1 }}>
                <Text style={{
                  fontSize: '16px',
                  color: '#333',
                  marginBottom: '5px',
                  margin: '0 0 5px 0'
                }}>{departure.time}</Text>
                <Text style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '5px',
                  margin: '0 0 5px 0'
                }}>{departure.airportCode}</Text>
                <Text style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '3px',
                  margin: '0 0 3px 0'
                }}>{departure.cityName}</Text>
                <Text style={{
                  fontSize: '12px',
                  color: '#999',
                  margin: 0
                }}>{departure.terminal}</Text>
              </Column>
              
              <Column style={{ width: '80px', textAlign: 'center' }}>
                <div style={{
                  height: '2px',
                  background: 'linear-gradient(to right, #9b87c4, #d0c4e0)',
                  margin: '20px 0'
                }}></div>
              </Column>
              
              <Column style={{ flex: 1, textAlign: 'right' }}>
                <Text style={{
                  fontSize: '16px',
                  color: '#333',
                  marginBottom: '5px',
                  margin: '0 0 5px 0'
                }}>{arrival.time}</Text>
                <Text style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '5px',
                  margin: '0 0 5px 0'
                }}>{arrival.airportCode}</Text>
                <Text style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '3px',
                  margin: '0 0 3px 0'
                }}>{arrival.cityName}</Text>
                <Text style={{
                  fontSize: '12px',
                  color: '#999',
                  margin: 0
                }}>{arrival.terminal}</Text>
              </Column>
            </Row>

            <Text style={{
              textAlign: 'center',
              color: '#999',
              fontSize: '12px',
              marginTop: '15px',
              margin: '15px 0 0 0'
            }}>Operated by {operatedBy}</Text>
          </Section>

          <Section style={{
            padding: '20px',
            background: 'white',
            borderBottom: '2px dashed #d0c4e0'
          }}>
            <Row style={{ marginBottom: '20px' }}>
              <Column>
                <Text style={{
                  color: '#666',
                  fontSize: '14px',
                  margin: '0 0 10px 0'
                }}>Passenger</Text>
                <Text style={{
                  color: '#333',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  margin: 0
                }}>{passenger.name}</Text>
              </Column>
              <Column>
                <Text style={{
                  color: '#666',
                  fontSize: '14px',
                  margin: '0 0 10px 0'
                }}>Baggage</Text>
                <Text style={{
                  color: '#333',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  margin: 0
                }}>{passenger.baggage}</Text>
              </Column>
            </Row>

            <Row>
              <Column>
                <Text style={{
                  color: '#666',
                  fontSize: '14px',
                  margin: '0 0 10px 0'
                }}>Class</Text>
                <Text style={{
                  color: '#333',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  margin: 0
                }}>{passenger.class}</Text>
              </Column>
              <Column>
                <Text style={{
                  color: '#666',
                  fontSize: '14px',
                  margin: '0 0 10px 0'
                }}>Seat</Text>
                <Text style={{
                  color: '#333',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  margin: 0
                }}>{passenger.seat}</Text>
              </Column>
            </Row>
          </Section>

          <Section style={{
            padding: '20px',
            background: 'white'
          }}>
            <Text style={{
              color: '#666',
              fontSize: '16px',
              marginBottom: '15px',
              margin: '0 0 15px 0'
            }}>Your trip receipt</Text>

            <Row style={{ marginBottom: '8px' }}>
              <Column>
                <Text style={{
                  fontSize: '14px',
                  color: '#666',
                  margin: 0
                }}>Fare {pricing.fare}</Text>
              </Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={{
                  fontSize: '14px',
                  color: '#666',
                  margin: 0
                }}>Fees & taxes +{pricing.fees}</Text>
              </Column>
            </Row>

            <Row style={{
              paddingTop: '10px',
              borderTop: '1px solid #eee',
              marginTop: '10px'
            }}>
              <Column>
                <Text style={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                  color: '#333',
                  margin: 0
                }}>Total {pricing.total} {pricing.currency}</Text>
              </Column>
            </Row>
          </Section>

          <Section style={{
            padding: '15px 20px',
            background: '#f8f8f8',
            fontSize: '11px',
            color: '#666',
            lineHeight: 1.4,
            borderRadius: '0 0 12px 12px'
          }}>
            <Text style={{ margin: 0, fontSize: '11px', lineHeight: 1.4 }}>
              Change allowed at any time with a penalty of £65, except in the case of not showing up for the flight (no-show), which does not allow change. No refunds.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}