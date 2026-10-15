const EXPEDITIONS_RANK_UP = [4, 8, 15, 25, 30, 35, 40, 45, 50, 55]
const STATS_PER_RANK_UP = 6

// Base stats bounds. Support frigates with 13 base stats at rank 1 have been reported (issues #2 and #6).
const MIN_BASE_STATS_RANK_1 = 1
const MAX_BASE_STATS_RANK_1 = 13
const MIN_BASE_STATS = -5
const MAX_BASE_STATS = 14

const GOOD_FROM_MAX = 3
const WARNING_FROM_MAX = 6

function get_rank_up (expeditions) {
    let rank_up = 0
    let i = 0
    while (i < EXPEDITIONS_RANK_UP.length && EXPEDITIONS_RANK_UP[i++] <= expeditions) rank_up++
    return rank_up
}

function get_max_stats (rank_up) {
    return rank_up <= 0
        ? MAX_BASE_STATS_RANK_1
        : MAX_BASE_STATS
}

function is_valid (base_stats, rank_up) {
    return rank_up <= 0
        ? base_stats >= MIN_BASE_STATS_RANK_1 && base_stats <= MAX_BASE_STATS_RANK_1
        : base_stats >= MIN_BASE_STATS && base_stats <= MAX_BASE_STATS
}

function get_parameter (id) {
    let value = parseInt(document.getElementById(id).value)
    if (typeof value !== 'number' || isNaN(value)) throw new Error(`${id} must be a number`)
    return value
}


let result_div = document.getElementById('result')
let warning_div = document.getElementById('warning')
let error_div = document.getElementById('error')

function display_result (base_stats, max_stats) {
    result_div.innerText = `${base_stats}/${max_stats}`
    if (base_stats >= max_stats - GOOD_FROM_MAX) result_div.style.backgroundColor = 'var(--good_color)'
    else if (base_stats >= max_stats - WARNING_FROM_MAX) result_div.style.backgroundColor = 'var(--warning_color)'
    else result_div.style.backgroundColor = 'var(--danger_color)'
}

function calculate () {
    try {
        result_div.innerText = ''
        result_div.style.backgroundColor = 'transparent'
        warning_div.innerText = ''
        error_div.innerText = ''

        let stats = get_parameter('stats')
        let bonuses = get_parameter('bonuses')
        let expeditions = get_parameter('expeditions')
        let organic = document.getElementById('organic').checked
        let rank_up = get_rank_up(expeditions)
        let base_stats = stats - (bonuses + rank_up * STATS_PER_RANK_UP)

        // Organic frigates always start with 0 expeditions whatever their rank,
        // so their hidden rank ups can't be deduced from the expedition count.
        if (organic) {
            result_div.innerText = `≤ ${base_stats}`
            result_div.style.backgroundColor = 'var(--warning_color)'
            warning_div.innerText = `Organic frigates always start with 0 expeditions regardless of their rank, and feeding them redistributes their stats.
            The value shown includes any rank up they had when found, so it is only an upper bound of their base stats and can't be verified.`
            return
        }

        // Glitched frigates: when the expedition count is exactly a rank up threshold,
        // pre-leveled frigates can miss their last rank up.
        if (rank_up > 0 && EXPEDITIONS_RANK_UP.includes(expeditions)) {
            let glitched_rank_up = rank_up - 1
            let glitched_base_stats = base_stats + STATS_PER_RANK_UP
            if (!is_valid(base_stats, rank_up) && is_valid(glitched_base_stats, glitched_rank_up)) {
                display_result(glitched_base_stats, get_max_stats(glitched_rank_up))
                warning_div.innerText = `This frigate is glitched: its expedition count (${expeditions}) is a rank up threshold but it missed that rank up.
                Its base stats are low, avoid buying it.`
                return
            }
            warning_div.innerText = `The expedition count (${expeditions}) is a rank up threshold.
            If you are buying this frigate it may be glitched (missed its last rank up), in which case its base stats are ${glitched_base_stats}/${get_max_stats(glitched_rank_up)}.`
        }

        display_result(base_stats, get_max_stats(rank_up))

        // Verify the base stat value is valid
        if (!is_valid(base_stats, rank_up))
            throw new Error(`This combination of stats should not be possible, verify the values you entered.
            If after verification you have not made an error please post a picture of the frigate in an issue on the GitHub of the project.`)
    } catch (error) {
        error_div.innerText = error.message
            ? error.message
            : error
    }
}

let example_div = document.getElementById('example')
example_div.addEventListener('click', e => {
    example_div.classList.toggle('fullscreen')
})

const INPUTS = ['stats', 'bonuses', 'expeditions']

function bind_input (id) {
    let input = document.getElementById(id)
    input.addEventListener('focusin', e => {
        input.select()
        document.getElementById(`${id}_highlight`).classList.add('visible')
    })
    input.addEventListener('focusout', e => {
        document.getElementById(`${id}_highlight`).classList.remove('visible')
    })
    input.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            let i = INPUTS.indexOf(id)
            if (i >= INPUTS.length - 1) calculate()
            else document.getElementById(INPUTS[i + 1]).focus()
        }
    })
}

INPUTS.forEach(bind_input)
