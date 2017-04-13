# Babbling about BABS

## Interaction:
- Map View:
	- Command/Control + click to select multiple stations
	- Pan & Zoom as normal
- Line Chart: 
	- Scroll-to-zoom within the defined area
	- Click and drag to pan horizontally
- Bar Chart:
	- Click to select station (affects all views)

## About: 
As justification of these views, I wanted to first give a contextual and visual cue towards the data in question, which is achieved through the map. Using bicycle icon location pins, the map easily communicates the objects in question. Then, given selectable markers on a map, I wanted to provide usable average data so that riders could determine their odds of finding a bike to ride. That manifested in a line chart, which shows the average number of available bikes on a per-minute basis, which can be further investigated through zooming. Lastly, the bar chart took form as a desire to visualize where riders end up -- each rider that parks their bike at a specific station adds to the area of that bar.

## Conclusions:
From an overview of the bar chart, it can be seen that an overwhelming majority rides end up at one of the two Caltrain bike share stations. When I first plotted the data on the map, it was strange to me that there were two overlapping markers, but after implementing the bar chart, it was obvious that the Caltrain station was the most popular destination. Exploring that data further, we see that most rides from the Caltrain station end up at the Ferry Building, with the most popular time being around noon (garnered from the number of bikes available at the Caltrain station at that time). It's fun to imagine that this is caused by bay area residents dropping into the city for a quick lunch or stroll around the downtown area.

## Implementation: 
This visualization was done with d3 and Mapbox.
