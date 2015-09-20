window.addEventListener('DOMContentLoaded', init, false);
function init() {
	//canvas
	function constructCanvas(canvasId, val, color) {
		var canvas = document.getElementById(canvasId);
		var ctx = canvas.getContext('2d');
		var width = ctx.canvas.width;
		var height = ctx.canvas.height;
		var radius = 0.4 * width;
		var cx = width / 2;
		var cy = height / 2;
		var inc = 270;

		ctx.beginPath();
		ctx.arc(cx, cy, radius, 0, Math.PI*2);
		ctx.closePath();

		// ctx.shadowBlur = .2;
		// ctx.shadowColor = color;

		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 10;
		ctx.stroke();

		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.font = "24px 'Arial', 'Tahoma', serif";
		ctx.fillStyle = "#fff";
		ctx.fillText(val, cx, cy);

		function drawCircle() {
			var x1=(Math.PI/180)*270;
			var x2=(Math.PI/180);

			ctx.beginPath();
			ctx.arc(cx, cy, radius, x1, x2*inc); 
			ctx.strokeStyle = color;
			ctx.lineWidth = 10;
			ctx.stroke();

			inc += 1;
			setTimeout(function() {
				if (inc < (271 + 3.6*val)) {
					drawCircle();
				} else return;
			}, 5);
		}
		drawCircle();
		}  
	constructCanvas('firstCanvas', 10, 'rgba(255, 0, 0, 1)');
	constructCanvas('secondCanvas', 75, '#EFAC50');
	constructCanvas('thirdCanvas', 45, '#5BB75D');
	constructCanvas('fourthCanvas', 90, '#5BBFDD');

	var App = {
		Models: {},
		Collections: {},
		Views: {}
	};
	App.Models.Item = Backbone.Model.extend({
		defaults: {
			checked: false
		}
	});
	App.Collections.Items = Backbone.Collection.extend({});
	App.Views.ItemsView = Backbone.View.extend({
		el: '.sales_table',
		initialize: function() {
			this.listenTo(this.collection, 'change', this.render);
			this.render();
		},
		events: {
			'click .sort' : 'sort',
			'click #headCheck' : 'editCheck',
			'change .check' : 'changeCheck',
			'click .control_delete' : 'removeModel'
		},
		removeModel: function(e) {
			var target = e.target;
			var id = $(target).closest('.sales_table_row').find('.check').attr('id');
			this.collection.findWhere({mId: id}).destroy();
			delete this['itemView' + id];
			$(target).closest('.sales_table_row').remove();
		},
		changeCheck: function(e) {
			var target = e.target;
			var checked = target.checked,
				id = target.id;
			this.collection.findWhere({mId: id}).set('checked', checked);
		},
		sort: function(e) {
			var target = e.target;
			var attr = $(target).text().toLowerCase();
			attr = (attr === 'product') ? 'title' : attr;
			if ($(target).hasClass('increase')) {
				this.collection.models.sort(function(a,b) {
					if (attr === 'price') {
						return (parseFloat(a.get(attr)) < parseFloat(b.get(attr))) ? 1 : -1;
					} else {
						return (a.get(attr).toLowerCase() < b.get(attr).toLowerCase()) ? 1 : -1;
					}
				});
				this.$el.find('.sort').each(function() {
					$(this).removeClass('decrease increase');
				});
				$(target).removeClass('increase');
				$(target).addClass('decrease');
			} else {
				this.collection.models.sort(function(a,b) {
					if (attr === 'price') {
						return (parseFloat(a.get(attr)) > parseFloat(b.get(attr))) ? 1 : -1;
					} else {
						return (a.get(attr).toLowerCase() > b.get(attr).toLowerCase()) ? 1 : -1;
					}
				});
				this.$el.find('.sort').each(function() {
					$(this).removeClass('increase decrease');
				});
				$(target).removeClass('decrease');
				$(target).addClass('increase');
			}
			this.render();
		},
		editCheck: function(e) {
			var target = e.target;
			this.collection.each(function(item) {
				item.set('checked', target.checked);
			});
		},
		render: function() {
			this.collection.each(function(item, i) {
				this['itemView' + i] = new App.Views.ItemView({
					el: $('.sales_table tbody tr').eq(i),
					model: item
				});
				this.$el.find('tbody').append(this['itemView' + i].render());
			}, this);
			return this;
		}
	});
	App.Views.ItemView = Backbone.View.extend({
		className: 'sales_table_row',
		template: _.template( $('#itemTpl').html() ),
		events: {
			'click .control_edit' : 'edit',
		},
		edit: function() {
			var $input = $('<input type="text"/>');
			$input.val(this.model.get('title'))
					.addClass('product');
			this.$el.find('td').eq(2).html('')
									.append($input);
			$input.focus();
			var self = this;
			$input.change(function() {
				self.model.set('title', $(this).val());
			});
		},
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}
	});
	
	App.Collections.items = new App.Collections.Items();
	var rows = document.querySelectorAll('.sales_table_row');
	[].forEach.call(rows, function(item) {
		var model = new App.Models.Item({
			mId: item.cells[0].innerHTML,
			title: item.cells[2].innerHTML,
			category: item.cells[3].innerHTML,
			price: item.cells[4].innerHTML.slice(0, -1)
		});
		App.Collections.items.add(model);
	});
	App.Views.itemsView = new App.Views.ItemsView({collection: App.Collections.items});
};