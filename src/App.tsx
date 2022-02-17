import {useState} from 'react'
import {
  ChakraProvider,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Text,
  HStack,
  Box,
  Flex,
  IconButton,
  Heading,
  useToast,
} from '@chakra-ui/react'

import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd'
import {DragHandleIcon, CloseIcon, AddIcon, CopyIcon} from '@chakra-ui/icons'
import './App.css'
import OldLeaderBoard from './OldLeaderBoard'
import type {Athlete} from './OldLeaderBoard'
import {useEffect} from 'react'
import {useSearchParams} from 'react-router-dom'
import {isEqual} from 'lodash-es'

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

type QueuedAthlete = Athlete & {
  chosen?: boolean
}

function App() {
  const [searchParams, setSearchParams] = useSearchParams()
  const athletesFromParams = JSON.parse(
    searchParams.get('athletes') ?? '[]',
  ) as QueuedAthlete[]
  const [queuedAthletes, setQueuedAthletes] = useState<QueuedAthlete[]>(
    // JSON.parse(searchParams.get('athletes') ?? '[]') as QueuedAthlete[],
    athletesFromParams,
  )

  const toast = useToast()

  const grid = queuedAthletes.length

  useEffect(() => {
    if (!isEqual(queuedAthletes, athletesFromParams)) {
      setSearchParams({athletes: JSON.stringify(queuedAthletes)})
    }
  }, [queuedAthletes])

  const getListStyle = (isDraggingOver: boolean) => ({
    padding: grid,
  })

  const athleteStyle = (isDragging: boolean, draggableStyle: any) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging

    // styles we need to apply on draggables
    ...draggableStyle,
  })
  return (
    <Container>
      <HStack justifyContent="space-between" alignItems="center" mb={4} py={2}>
        <Heading as="h1">CFR7 Open Draft</Heading>
        <Button
          rightIcon={<CopyIcon />}
          onClick={() => {
            navigator.clipboard.writeText(window.location.href)
            toast({
              title: 'Copied the link to your clipboard',
              status: 'info',
              duration: 2000,
              isClosable: true,
            })
          }}
        >
          Share Link
        </Button>
      </HStack>
      <Tabs>
        <TabList>
          <Tab>Athlete List</Tab>
          <Tab>Your Picks</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <OldLeaderBoard
              chosenAthletes={queuedAthletes}
              onAthleteClick={({athlete, action}) => {
                setQueuedAthletes((athletes) => {
                  if (action === 'add') {
                    return athletes.concat(athlete)
                  } else {
                    return athletes.filter((a) => a.id !== athlete.id)
                  }
                })
              }}
            />
          </TabPanel>
          <TabPanel>
            <DragDropContext
              onDragEnd={(result) => {
                // dropped outside the list
                if (!result.destination) {
                  return
                }

                const newAthletes = reorder(
                  queuedAthletes,
                  result.source.index,
                  result.destination.index,
                )

                setQueuedAthletes(newAthletes)
              }}
            >
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                    backgroundColor={
                      snapshot.isDraggingOver ? 'gray.100' : 'white'
                    }
                  >
                    {queuedAthletes.map((athlete, index) => (
                      <Draggable
                        key={athlete.id}
                        draggableId={athlete.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <HStack
                            w="100%"
                            alignItems="center"
                            justifyContent="space-between"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={athleteStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style,
                            )}
                            backgroundColor={
                              snapshot.isDragging || athlete.chosen
                                ? 'green.100'
                                : 'white'
                            }
                          >
                            <HStack>
                              <DragHandleIcon />
                              <Text>{index + 1}</Text>
                              <Text>{athlete.competitor_name}</Text>
                            </HStack>
                            {!snapshot.isDragging && !athlete.chosen && (
                              <HStack>
                                <IconButton
                                  aria-label="claim"
                                  icon={<AddIcon />}
                                  colorScheme="green"
                                  onClick={() => {
                                    setQueuedAthletes((athletes) =>
                                      athletes.map((a) => {
                                        if (a.id === athlete.id) {
                                          a.chosen = true
                                        }
                                        return a
                                      }),
                                    )
                                  }}
                                />

                                <IconButton
                                  aria-label="remove"
                                  colorScheme="red"
                                  icon={<CloseIcon />}
                                  onClick={() => {
                                    setQueuedAthletes((athletes) =>
                                      athletes.filter(
                                        (a) => a.id !== athlete.id,
                                      ),
                                    )
                                  }}
                                />
                              </HStack>
                            )}
                          </HStack>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  )
}

export default App
