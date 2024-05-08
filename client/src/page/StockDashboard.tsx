import { useSelector } from "react-redux"
import useSocket from "../hooks/useSocket"
import { Line } from "react-chartjs-2";
import 'chart.js/auto';
import { StockItemData } from "../types/StockItemData";

const StockDashboard = () => {
    useSocket('ws://stock-ticker.multiplayerbackend.tech');
    const data = useSelector((state: any) => state.data);
    return (
        <div className="p-5 pt-8 dark:bg-[#121212] bg-[#ffff] w-full dark:text-white h-screen">
            <h1 className="text-4xl text-center mb-20">Stock Ticker</h1>
            <div className="max-w-2xl mx-auto">
                {Object.keys(data.data).map((key: any) => {
                    const innerKey = Object.keys(data.data[key])
                    const innerValue: StockItemData[] = Object.values(data.data[key][innerKey[0]])
                    console.log(innerValue)
                    const latestData: StockItemData = innerValue[0]
                    const currentPrice = parseFloat(latestData.close.toString()).toFixed(2)
                    const chartData: { labels: string[], datasets: { labels: [], data: any, borderColor: string, tension: number }[] } = {
                        labels: [],
                        datasets: [
                            {
                                labels: [],
                                data: [],
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            }
                        ]
                    }
                    innerValue.forEach((value: any) => {
                        chartData.labels.push(value.datetime)
                        chartData.datasets[0].data.push(parseFloat(value.close))
                    })
                    return (
                        <div key={key} className="mx-auto grid grid-cols-3 font-semibold text-lg h-20  items-center justify-between px-8 py-2 rounded-md mt-5   shadow-xl bg-[#ffff]   dark:bg-[#1E1E1E]">
                            <h3>{key}</h3>
                            <span>${currentPrice}</span>
                            <StockChart key={Math.random() * 10} data={chartData} />
                        </div>
                    )
                }
                )}

            </div>
        </div>
    )
}

const StockComponent = ({ data }: any) => {
    console.log(data)
    return (
        <div>
            {/* <h4>{data.name}</h4> */}
            <ul>
                {Object?.keys(data).map((key: any) => {
                    return (
                        // <></>
                        <li key={key}>{data[key]}</li>
                    )
                }
                )}


            </ul>
        </div>
    )

}

const StockChart = ({ data }: any) => {
    const options = {
        elements: {
            point: {
                radius: 0
            }
        },
        scales: {
            x: {
                ticks: {
                    display: false
                },
                grid: {
                    display: false
                },

                grace: '10%',
            },
            y: {
                ticks: {
                    display: false
                },
                grid: {
                    display: false
                },
                grace: '10%',
            }
        },
        tooltip: {
            mode: 'index',
            intersect: false,
            enabled: false
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: false // Disable tooltips for Chart.js version 2.x
            },
        },
        maintainAspectRatio: true
    };
    return <Line data={data} options={options} />;
}

export default StockDashboard
