var totalData, seqData, ref, sam, isW, id_s,
    sam_tick, tickInf, plcList, collect,
    posMax=656, covMax,
    colorPath;

var margin = {top:0, right:7, bottom:32, left:68},
    width = 590, height = 440;

var svgS, svgR, hGrid=17, wGrid=16,
    marginL=40, marginR=34, refH=42;
var colorStat = d3.scale.linear().range(['#ebebff', 'blue']).domain([0, 100]),
    colorFs = d3.scale.linear().range(['#ffebeb', 'red']).domain([0, 100]);

// define axes scale
var xScale = d3.scale.linear().domain([0,posMax]).range([4, width-4]),
    yScale;

var pathFun = d3.svg.line()
        .x(function(d) { return xScale(d.pos) })
        .interpolate('linear');
    
var xAxis, yAxis,
    axisX, axisY;

$(document).ready(function(){
    plot0();
    $.ajax({
        async:false, dataType:"json", url:"data/tick.json",
        success: function(data) {
            sam_tick=data.ids;
            tickInf=data.tick;
            plcList=data.plcList;
            collect=data.collect
        }
    });

    loadSmpBatch();
    $('#sampleBatch').change(function(){loadSmpBatch()});
    
    $('#guide').css("width", (wGrid-3)+'px')
        .css("height", ($('#plotStat').height()+refH+9)+'px');
    
    $("#ref").mousemove(function(e) {
        var xMouse = e.pageX - this.offsetLeft - 19,
            xmax = ref.length*wGrid + marginL - 17;
        $("#guide").css("left", (xMouse<marginL? marginL : (xMouse>xmax? xmax : xMouse)) + 'px').show()
    })
        .mouseout(function(){ $("#guide").hide()})
});

function loadSmpBatch(){
    $('#sampleInfo').hide();
    var batch = $('#sampleBatch').val();
    isW = /w/i.test(batch)? 1 : 0;
    d3.tsv('data/'+batch+".tsv", function(data) {
        totalData = data;
        sam = uniqVal(totalData,'sample');
        ref = uniqVal(totalData,'ref');

        colorPath =d3.scale.ordinal()
            .domain(ref)
            .range(d3.range(0,ref.length).map(function(d){return d3.hsl(360/(ref.length) * d, 1, 0.45)}));

        d3.selectAll('#seqPath path').remove();
        ref.forEach(function(d){
            seqPath.append("path")
                .attr("id", d)
                .attr("stroke", colorPath(d))
                .on('mouseover', function(){mouseovered(d)})
                .on('mouseout', function(){mouseovered(false)})
        });
        
        d3.tsv('data/'+batch+".stat", function(statData) {
            plot(statData);
            changeSample()
        })
    })
}

function uniqVal(source, value){
    var arr = source.map(function(d){return d[value]}),
        obj = {};
    arr.forEach(function(d){ if (!obj[d]){ obj[d]=1 }});
    if (value=='sample'){
        console.log(Object.keys(obj).sort(sortbytick));
        return Object.keys(obj).sort(sortbytick)
    } else {
        return Object.keys(obj).sort()
    }
}
function sortbytick(a,b){
    return sam_tick[a] < sam_tick[b] ? -1 : 1
}

function plot(statData){
    svgS.attr("height", hGrid*sam.length)
        .attr("width", wGrid*ref.length + marginL + marginR);
    d3.select("#bgStat").attr("height", hGrid*sam.length)
        .attr("width",wGrid*ref.length);
    
    svgS.selectAll("rect:not(#bgStat), text").remove();

    var svgS_txt = svgS.append("g")
        .attr("transform", "translate(4,13)")
        .selectAll("text")
        .data(sam).enter();
    
    svgS_txt.append("text")
        .on("click", function(d){changeSample(d)})
        .attr("transform", function(d,i) { return "translate(0," + hGrid*i + ")" })
        .text(function(d) { return sam_tick[d] });

    svgS_txt.append("text")
        .attr("class", "noRef")
        .on("click", function(d){changeSample(d)})
        .attr("transform", function(d,i) { return "translate(" + (wGrid*ref.length + marginL) + "," + hGrid*i + ")" })
        .text(function(d) { return d });

    d3.select("#ref svg")
        .attr("width", wGrid*ref.length + marginL + marginR);
    d3.selectAll("#ref text").remove();
    svgR.selectAll("text")
        .data(ref).enter()
        .append("text")
        .attr("id", function(d){return 'lg'+d})
        .attr("transform", function(d,i) { return "translate(" + (wGrid*i-1) + ",0)rotate(-90)" })
        .text(function(d) { return d.split("_")[0] })
        .attr("fill", colorPath);

    if (statData){
        svgS.append("svg:a").attr("xlink:href", "#")
            .attr("transform", "translate(" + marginL + ",0)")
            .selectAll("rect")
            .data(statData).enter()
            .append("rect")
            .attr("x", function(d){return ref.indexOf(d.ref)*wGrid })
            .attr("y",function(d){return sam.indexOf(d.sample)*hGrid})
            .attr("width", wGrid)
            .attr("height", hGrid)
            .attr("fill",function(d){return d.perc==0? 'none' : (d.cov>1.2? colorFs(d.perc) : (d.perc<0.8? 'white' : colorStat(d.perc)))})
            .on("click", function(d){changeSample(d.sample)})
            .on('mouseover', function(d){mouseoverH(d)})
            .on('mouseout', function(){mouseoverH(false)})        
    }

    svgS.append("rect").attr("id","hlStat")
        .attr("x",1)
        .attr("width",wGrid*ref.length+marginL+marginR-2).attr("height",hGrid-2);
}

function plot0() {
    svgS = d3.select("#plotStat").append("svg");

    svgS.append("rect")
        .attr("id","bgStat")
        .attr("class", "bg0")
        .attr("x", marginL);

    svgR = d3.select("#ref").append("svg")
        .attr("height", refH)
        .append("g")
        .attr("transform", "translate(" + (marginL+14) + "," + (refH-2) + ")")

    var svg = d3.select("#plotZone")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

//background
    svg.append("rect").attr("class", "bg0")
        .attr("width",width)
        .attr("height", height)

//axis
    axisX = svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")");
    axisY = svg.append("g").attr("class", "y axis");

//axis label
    var axisLab = svg.append("g").attr("class", "axisLab");
    axisLab.append("text")
        .attr("transform", "translate("+ width/2 +","+(height+margin.bottom-2)+")")
        .text("Position");
    axisLab.append("text")
        .attr("transform", "translate("+ (-58) +","+height/2+") rotate(-90)")
        .text("Coverage");

//line
    seqPath = svg.append("g").attr("id", "seqPath");
}


function changeSample(x){
    if (x){
        if (x==id_s){ return }
        id_s = x
    } else if (!id_s || sam.indexOf(id_s)==-1){
        id_s = sam[0]
    }
    d3.select("#hlStat").attr("y", sam.indexOf(id_s)*hGrid+1);
    
    seqData = totalData.filter(function(o){return o.sample== id_s});
    
    covMax = Math.max.apply(null, seqData.map(function(d){return d.cov}));
    if (covMax<100){covMax=100}

    yScale = d3.scale.linear().domain([0,covMax]).range([height-4, 4]);
//    yScale = d3.scale.log().domain([1,covMax+1]).range([height-4, 4]);
    
    pathFun.y(function(d) { return yScale(d.cov) });
        
    //place axes
    xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(-height);
    yAxis = d3.svg.axis().scale(yScale).orient("left").tickSize(-width);

    axisX.call(xAxis);
    axisY.call(yAxis);
    
    ref.forEach(function(d){
        var p = seqData.filter(function(o){return o.ref==d});
        d3.select('#'+d).attr("d", pathFun(p));
        d3.select('#lg'+ d).classed('noRef', d3.select('#'+d).attr("d")? false : true)
    });

    if (isW){
        $('#sampleInfo').hide()
    } else {
        $('#sampleInfo').show();
        var id_t = sam_tick[id_s],
            st = id_t.substring(0,1),
            stage = st=='M'? 'Male' : (st=='F'? 'Famale' : 'Nymph');
        $('#kid').html(id_t);
        $('#sid').html(id_s);
        $('#stage').html(stage);
        var id_c = tickInf[id_t][0],
            col = collect[id_c];
        $('#collDate').html(col[0]);
        $('#collPlace').html(plcList[col[1]]);
        $('#gel').html(tickInf[id_t][1])
    }
}

function mouseovered(active,txt){
    if (active){
        d3.select('#'+active).classed("line_active", true);
        if (!txt){
            var xMouse = d3.event.pageX-15,
                yMouse = d3.event.pageY-30;
            $("#tip").css("left", xMouse+"px").css("top", yMouse + "px").show()
                .html(active)
        }
    } else {
        d3.selectAll('path').classed("line_active", false);
        $("#tip").hide()
    }
}

function mouseoverH(active){
    if (active){
        var xMouse = d3.event.pageX-15,
            yMouse = d3.event.pageY-30;
        $("#tip").css("left", xMouse+"px").css("top", yMouse + "px").show().html(active.ref);
        if (active.sample==id_s){
            d3.select('#'+active.ref).classed("line_active", true)
        }
    } else {
        $("#tip").hide();
        d3.selectAll('path').classed("line_active", false)
    }
}
