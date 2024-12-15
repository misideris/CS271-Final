import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Slider from "@mui/material/Slider"
import { Typography } from "@mui/material";
import { List, ListItem } from "@mui/material";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid'; 
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import * as dff from "./dff.js";

const SelectableGrid = ({points, setPoints, mobileView}) => {
  const svgRef = useRef(null);
  const [edges, setEdges] = useState([])
  const [numPoints, setNumPoints] = useState(4)
  const [isProcessing, setIsProcessing] = useState(false)

  const clearCanvas = () => {
    setPoints({ X: [], Y: [] }); 
    setEdges([]); 
    d3.select(svgRef.current).selectAll(".line1-circle").remove(); 
    d3.select(svgRef.current).selectAll(".line2-circle").remove(); 
    d3.select(svgRef.current).selectAll("path").remove(); 
  }

  const computePoints = () => {
    let X = points.X
    let Y = points.Y
    if (X.length == numPoints && Y.length == numPoints && !isProcessing) {
      setIsProcessing(true)
      let res = dff(X,Y) 
      let path = res[1]
      let newEdges = path.map((pair) => [points.X[pair[0]], points.Y[pair[1]]])
      setEdges(newEdges)
      setIsProcessing(false)
    } else {
       {/*If user attempts to compute distance without points*/}
      alert("Make sure to select all points!")
    }
  }
 {/*Fucntion to randomize points on grid, while staying within grid dimensions*/}
  const randomizePoints = () => {
    clearCanvas()
    let newX = 0;
    let newY = 0;
    let X = []
    let Y = []
    for (let i = 0; i < 2*numPoints; i++) {
      newX = mobileView ? Math.random() * 300 : Math.random()*450;
      newY = Math.random()*450;
      if (i < numPoints) {
        X.push([newX, newY])
      } else {
        Y.push([newX, newY])
      }
    }
    setPoints({X: X, Y: Y})
  }

{/*Hover effects for grid and data points*/}
  const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("visibility", "hidden")
  .style("background-color", "#fff")
  .style("padding", "5px")
  .style("border", "1px solid #ccc")
  .style("border-radius", "4px")
  .style("box-shadow", "0px 0px 10px rgba(0,0,0,0.1)")
  .style("font-family", "Sorts Mill Goudy")
  .style("color", "#272030");

  const drawLines = () => {
    const svg = d3.select(svgRef.current);
  
 {/*Drawing line 1*/}
    const lineGenerator = d3
      .line()
      .x(d => d[0]) 
      .y(d => d[1]); 
  
    svg.selectAll(".line1-path").remove(); 
    svg
      .append("path")
      .datum(points.X)
      .attr("class", "line1-path")
      .attr("d", lineGenerator)
      .attr("fill", "none")
      .attr("stroke", "#436B5C")
      .attr("stroke-width", 2);
  
    svg.selectAll(".line2-path").remove(); 
    svg
      .append("path")
      .datum(points.Y)
      .attr("class", "line2-path")
      .attr("d", lineGenerator)
      .attr("fill", "none")
      .attr("stroke", "#8B0000")
      .attr("stroke-width", 2);
  };

  useEffect(() => {
 {/*Dimensions for grid component*/}
    const width = mobileView ? 335 : 450;
    const height = mobileView ? 510: 450;
    const margin = { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 };
    
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
  
 {/*Scaling the coordinates*/}
    const xScale = d3.scaleLinear().domain([0, 10]).range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().domain([0, 10]).range([height - margin.bottom, margin.top]);
    
 {/*Clearing all lines before calculating new distance*/}
    svg.selectAll(".frechet-path").remove();

 {/*Generating lines*/}
    const lineGenerator = d3.line()
      .x(d => d[0])
      .y(d => d[1]);

 {/*Adding in result*/}
    edges.forEach((edge) => {
      svg.append('path').datum(edge).attr('d', lineGenerator).attr('class', 'frechet-path').attr('fill','none').attr('stroke','#272030')
    })

  {/*Drawing grid*/}
    const gridData = d3.range(11);
    svg.selectAll(".grid-line")
      .data(gridData)
      .join("line")
      .attr("class", "grid-line")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#ddd");

 {/*Drawing line 1 circles*/}
svg.selectAll(".line1-circle")
  .data(points.X)
  .join(
    (enter) =>
      enter
        .append("circle")
        .attr("class", "line1-circle")
        .attr("cx", (d) => d[0])
        .attr("cy", (d) => d[1])
        .attr("r", 5) 
        .attr("fill", "#436B5C")
        .on("mouseover", function (event, d) {
          tooltip.style("visibility", "visible")
          .html(`X: ${d[0].toFixed(0)}, Y: ${d[1].toFixed(0)}`)
          .style("left", (event.pageX + 10) + "px") 
          .style("top", (event.pageY + 10) + "px");
          d3.select(this)  
            .transition()  
            .duration(250)  
            .attr("r", 9); 
        })
        .on("mouseout", function () {
          tooltip.style("visibility", "hidden");
          d3.select(this) 
            .transition()  
            .duration(250)
            .attr("r", 5);  
        }),
    (update) => update,
    (exit) => exit.remove()
  );

 {/*Drawing line 2 circles*/}
svg.selectAll(".line2-circle")
  .data(points.Y)
  .join(
    (enter) =>
      enter
        .append("circle")
        .attr("class", "line2-circle")
        .attr("cx", (d) => d[0])
        .attr("cy", (d) => d[1])
        .attr("r", 5) 
        .attr("fill", "#8B0000")
        .on("mouseover", function (event, d) {
          tooltip.style("visibility", "visible")
          .html(`X: ${d[0].toFixed(0)}, Y: ${d[1].toFixed(0)}`)
          .style("left", (event.pageX + 10) + "px") 
          .style("top", (event.pageY + 10) + "px");

          d3.select(this)  
            .transition() 
            .duration(250) 
            .attr("r", 9);  
        })
        .on("mouseout", function () {
          tooltip.style("visibility", "hidden");
          
          d3.select(this)  
            .transition() 
            .duration(250) 
            .attr("r", 5);  
        }),
    (update) => update,
    (exit) => exit.remove()
  );
    drawLines()

    svg.on("click", (e) => {
      const [x, y] = d3.pointer(e, svg.node());
    
  {/*User attempts to place points on top of another point*/}
      setPoints((prevPoints) => {
        const isDuplicate =
          prevPoints.X.some((p) => p[0] === x && p[1] === y) ||
          prevPoints.Y.some((p) => p[0] === x && p[1] === y);
        if (!isDuplicate) {
          let updatedPoints = { ...prevPoints };
    
          if (updatedPoints.X.length >= numPoints && updatedPoints.Y.length < numPoints) {
            updatedPoints.Y = [...updatedPoints.Y, [x, y]];
          } else if (updatedPoints.X.length < numPoints) {
            updatedPoints.X = [...updatedPoints.X, [x, y]];
          }
          return updatedPoints;
        }
        return prevPoints;
      });
    });
  
    svg.selectAll(".grid-line-horizontal")
      .data(gridData)
      .join("line")
      .attr("class", "grid-line-horizontal")
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("stroke", "#ddd"); 
  }, [points, edges, numPoints, mobileView]);
  
  return (
  <div>
    <div style={{ marginBottom: "10px" }}>

    {/* Clear button */}
    <Button
      variant="contained"
      size="small"
      sx={{
        bgcolor: '#B58275',
        color: "#F8F8F8",
        border: "1px solid #272030",
        fontFamily: "Sorts Mill Goudy",
        fontSize: "15px",
        mr: "3%",
        mb: '3%',
        ":hover": {
          backgroundColor: '#9CABA6',
          color: '#2D2D2B',
        },
        boxShadow: "none",
      }}
      onClick={clearCanvas}
    >
      Clear
    </Button>
    {/*Compute distance button*/}
    <Button
      variant="contained"
      size="small"
      sx={{
        bgcolor: '#B58275',
        border: "1px solid #272030",
        color: "#F8F8F8",
        fontFamily: "Sorts Mill Goudy",
        fontSize: "15px",
        mr: "2%",
        mb: '3%',
        ":hover": {
          backgroundColor: '#9CABA6',
          color: '#2D2D2B',
        },
        boxShadow: "none",
      }}
      onClick={computePoints}
    >
      Compute Distance
    </Button>
    {/*Randomize Points Button*/}
    <Button
      variant="contained"
      size="small"
      sx={{
        bgcolor: '#B58275',
        border: "1px solid #272030",
        color: "#F8F8F8",
        fontFamily: "Sorts Mill Goudy",
        mb: '3%',
        fontSize: "15px",
        ":hover": {
          backgroundColor: '#9CABA6',
          color: '#2D2D2B',
        },
        boxShadow: "none",
      }}
      onClick={randomizePoints}
    >
      Randomize Points
    </Button>
    <br />
    <Typography variant='h7' fontFamily="Sorts Mill Goudy">
      {`Number of Points: ${numPoints}`}
    </Typography>
    <br />
    <Slider
      min={2}
      max={10}
      marks
      step={1}
      defaultValue={5}
      valueLabelDisplay="auto"
      sx={{
        color: "#91a29c",
        "& .MuiSlider-thumb": {
          backgroundColor: "#436B5C",
        },
        "& .MuiSlider-thumb:hover, & .MuiSlider-thumb.Mui-focusVisible": {
          boxShadow: "0px 0px 0px 8px rgba(67, 107, 92, 0.16)",
        },
        "& .MuiSlider-thumb.Mui-active": {
          boxShadow: "0px 0px 0px 12px rgba(67, 107, 92, 0.24)",
        },
      }}
      onChangeCommitted={(e, v) => {
        setNumPoints(v);
        clearCanvas();
      }}
    />
  </div>
  <svg ref={svgRef}></svg>
  <div></div>
</div>
  );
};

function App() {
  const [mobileView, setMobileView] = useState(false);
  const [edges, setEdges] = useState([]);
  const [points, setPoints] = useState({X:[],Y:[]})

  useEffect(() => {

    {/*Function to adjust for mobile view*/}
    const checkMobileView = () => {
      setMobileView(window.innerWidth <= 768);
    };
    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  return (
<Box sx ={{bgcolor: '#D9D1CF'}}>
  {/* AppBar */}
  <Box sx={{ flexGrow: 1 }}>
    <AppBar
      position="static"
      sx={{
        height: mobileView ? "3rem" : "3.25rem",
        backgroundColor:'#B58275',
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Button
          sx={{
            color: "#F8F8F8",
            fontFamily: "Sorts Mill Goudy",
            fontSize: mobileView ? "0.6rem" : "1.5rem",
            mb: "0.5%",
            mr: "auto",
            ":hover": {
              backgroundColor: "transparent",
              color: "#9CABA6",
              cursor: "default",
            },
            boxShadow: "none",
          }}
        >
          Mia Sideris
        </Button>
        <Button
          sx={{
            color: "#F8F8F8",
            fontFamily: "Sorts Mill Goudy",
            fontSize: mobileView ? "0.6rem" : "1.5rem",
            mb: "0.5%",
            ":hover": {
              backgroundColor: "transparent",
              color: "#9CABA6",
              cursor: "default",
            },
            boxShadow: "none",
          }}
        >
          Discrete Fréchet Distance
        </Button>
      </Toolbar>
    </AppBar>
  </Box>

  {/* Main content with left and right panels */}
  <Box
    sx={{
      display: "flex",
      flexDirection: mobileView ? 'column' : 'row',
      justifyContent: "flex-start",
      alignItems: "flex-start",
      padding: "20px",
    }}
  >
    {/* Left panel: instructions and canvas */}
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        width: mobileView ? "95%" : "45%",
        gap: "10px",
      }}
    >
      {/*  Instructions */}
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: mobileView ? "90%" : "610px",
          padding: "15px",
          bgcolor: "#FOE2D2",
          border: "1px solid #272030",
          fontFamily: "Sorts Mill Goudy",
          ml: mobileView ?  "12px" :"8px",
        }}
      >
      <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            fontFamily: "Sorts Mill Goudy",
            color: '#272030',
            textDecoration: 'underline',
          }}
        >
          Getting Started
      </Typography>
        <List sx={{ fontFamily: "Sorts Mill Goudy", color: "#272030", lineHeight: "1.2" }}>
      <ListItem sx={{ paddingTop: 0, paddingBottom: 0, marginBottom: "4px" }}>
      <Typography variant="body1" fontFamily="Sorts Mill Goudy">
        1. Use the slider to select your desired number of data points per line.
      </Typography>
      </ListItem>
      <ListItem sx={{ paddingTop: 0, paddingBottom: 0, marginBottom: "4px" }}>
      <Typography variant="body1" fontFamily="Sorts Mill Goudy">
        2. Select any space on the grid to place your points, or simply use the <strong>Randomize Points</strong> button to randomly generate two curves. If selecting your own data points, ensure all points are selected before computing the distance!
      </Typography>
      </ListItem>
      <ListItem sx={{ paddingTop: 0, paddingBottom: 0, marginBottom: "4px"  }}>
      <Typography variant="body1" fontFamily="Sorts Mill Goudy">
        3. Use the <strong>Compute Distance</strong> button to calculate the Fréchet distance between your lines! 
        <strong> Clear</strong> the canvas, and try other line lengths for further exploration!
      </Typography>
      </ListItem>
       </List>
      </Paper>

      {/* Canvas section */}
      <Paper
        elevation={10}
        sx={{
          width: "100%",
          maxWidth: mobileView ? "90%" : "600px",
          padding: "20px",
          margin: "auto",
          mt: "5px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          ml: "8px",
          bgcolor: "#FOE2D2",
          border: "1px solid #272030",
        }}
      >
        {/* Canvas component */}
        <SelectableGrid points={points} setPoints={setPoints} edges={edges} setEdges={setEdges} mobileView={mobileView} />
      </Paper>
    </Box>

    {/* Right panel: description and table */}
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        paddingLeft:  mobileView ?  "0px" :"20px",
        width: mobileView ? "95%" : "51%",
        gap: "10px",
      }}
    >
         {/* Description */}
      <Paper
        elevation={3}
        sx={{
          width:  mobileView ? "95%":"100%",
          padding: "15px",
          bgcolor: "#FOE2D2",
          ml: mobileView ? "5px":"0px",
          mt: mobileView ? "15px":"0px",
          border: "1px solid #272030",
          fontFamily: "Sorts Mill Goudy",
        }}
      >
          <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            fontFamily: "Sorts Mill Goudy",
            color: '#272030',
            marginBottom: "10px",
            textDecoration: 'underline',
          }}
        >
          What is the Discrete Fréchet Distance?
        </Typography>
        <Typography
          variant="body1"
          fontFamily="Sorts Mill Goudy"
          color='#272030'
          sx={{
            lineHeight: "1.6",
          }}
        >
             The Discrete Fréchet Distance is a measure of similarity between two curves, represented as sequences of discrete points. 
             It is often described using the analogy of a person walking a dog on a leash, where each traverses down a separate path. 
             The goal is to minimize the maximum leash length required for both to continue following their paths without retracting their steps. 
             The Fréchet is order-sensitive, respecting the sequential order of the points along the curves. 
        </Typography>
              <Card sx={{ maxWidth: "100%", mt: "15px" }} elevation={0}>
        <CardActionArea>
          <CardMedia
            component="img"
            height="120"
            image={`${process.env.PUBLIC_URL}/images/frog.jpeg`}
            alt="Frog Hopping"
          />
          <CardContent sx={{ pb: 0.5 }}>
            <Typography variant="body1" sx={{ color: "#272030", fontFamily: "Sorts Mill Goudy"}}>
              "Frog Hopping" animation demonstrated by <strong>Omrit Filtser</strong>!
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
        <Button
          size="small"
          variant="contained"
          href="https://omrit.filtser.com/#discrete"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            ml:1.2,
            color: "#F8F8F8",
            bgcolor: "#B58275",
            border: "1px solid #272030",
            fontFamily: "Sorts Mill Goudy",
            fontSize: "1rem",
            textTransform: "none",
            display: "flex",
            alignItems: "center", 
            '&:hover': { bgcolor: "#9CABA6", color: "#272030" },
          }}
        >
            <Typography variant="button" sx={{ fontFamily: "Sorts Mill Goudy"}}>
              Learn More <OpenInNewIcon sx={{ ml: 1, mb: -0.5}} fontSize="small" />
            </Typography>
        </Button>
        </CardActions>
      </Card>
      </Paper>

      {/* Table paper */}
      <Paper
        elevation={3}
        sx={{
          width: mobileView ? "95%" : "99%",
          padding: "20px",
          bgcolor: "#FFF",
          border: "1px solid #272030",
          display: "flex",
          mt: "5px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Grid container spacing={2}>
          {/* Table for line 1 */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontFamily="Sorts Mill Goudy" gutterBottom>
              <strong>Line 1 Coordinates</strong>
            </Typography>
            <Table
              sx={{
                fontFamily: "Sorts Mill Goudy",
                "& .MuiTableCell-root": { fontFamily: "Sorts Mill Goudy", borderBottom: "1px solid #272030" },
                "& .MuiTableRow-root:nth-of-type(odd)": { backgroundColor: "#D1D8D6" },
                "& .MuiTableRow-root:hover": { backgroundColor: "#9CABA6" },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell><strong>Point</strong></TableCell>
                  <TableCell><strong>X</strong></TableCell>
                  <TableCell><strong>Y</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {points.X.map((point, index) => (
                  <TableRow key={index}>
                    <TableCell>{`Point ${index + 1}`}</TableCell>
                    <TableCell>{point[0].toFixed(0)}</TableCell>
                    <TableCell>{point[1].toFixed(0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>

          {/* Table for line 2 */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontFamily="Sorts Mill Goudy" gutterBottom>
              <strong>Line 2 Coordinates</strong>
            </Typography>
            <Table
              sx={{
                fontFamily: "Sorts Mill Goudy",
                "& .MuiTableCell-root": { fontFamily: "Sorts Mill Goudy", borderBottom: "1px solid #272030" },
                "& .MuiTableRow-root:nth-of-type(odd)": { backgroundColor: "#D1D8D6" },
                "& .MuiTableRow-root:hover": { backgroundColor: "#9CABA6" },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell><strong>Point</strong></TableCell>
                  <TableCell><strong>X</strong></TableCell>
                  <TableCell><strong>Y</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {points.Y.map((point, index) => (
                  <TableRow key={index}>
                    <TableCell>{`Point ${index + 1}`}</TableCell>
                    <TableCell>{point[0].toFixed(0)}</TableCell>
                    <TableCell>{point[1].toFixed(0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  </Box>
</Box>
  );
}

export default App;